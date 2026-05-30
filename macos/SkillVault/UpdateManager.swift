import Cocoa
import Foundation

struct UpdateInfo {
    let version: String
    let notes: String
    let dmgUrl: String?
}

class UpdateManager {
    private let repoOwner = "Mentaturan"
    private let repoName = "SkillVault"
    private let userDefaults = UserDefaults.standard
    private let lastCheckKey = "update_last_check_time"
    private let skippedVersionKey = "update_skipped_version"

    var currentVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "0.0.0"
    }

    func checkForUpdate(completion: @escaping (Result<UpdateInfo?, Error>) -> Void) {
        let urlString = "https://api.github.com/repos/\(repoOwner)/\(repoName)/releases/latest"
        guard let url = URL(string: urlString) else {
            completion(.failure(NSError(domain: "UpdateManager", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])))
            return
        }

        var request = URLRequest(url: url)
        request.setValue("application/vnd.github+json", forHTTPHeaderField: "Accept")
        request.timeoutInterval = 15

        let task = URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }

            guard let data = data,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let tagName = json["tag_name"] as? String else {
                completion(.failure(NSError(domain: "UpdateManager", code: 2, userInfo: [NSLocalizedDescriptionKey: "Invalid response"])))
                return
            }

            let latestVersion = tagName.trimmingCharacters(in: CharacterSet(charactersIn: "v"))
            let body = json["body"] as? String ?? ""
            let dmgUrl = self?.findDmgAssetUrl(from: json)

            let skipped = self?.userDefaults.string(forKey: self!.skippedVersionKey)
            if skipped == latestVersion {
                completion(.success(nil))
                return
            }

            if self?.isVersion(latestVersion, newerThan: self?.currentVersion ?? "0.0.0") == true {
                let info = UpdateInfo(version: latestVersion, notes: body, dmgUrl: dmgUrl)
                completion(.success(info))
            } else {
                completion(.success(nil))
            }

            self?.userDefaults.set(Date().timeIntervalSince1970, forKey: self!.lastCheckKey)
        }
        task.resume()
    }

    func downloadAndOpenDmg(from urlString: String, completion: @escaping (Result<Void, Error>) -> Void) {
        guard let url = URL(string: urlString) else {
            completion(.failure(NSError(domain: "UpdateManager", code: 3, userInfo: [NSLocalizedDescriptionKey: "Invalid DMG URL"])))
            return
        }

        let tempDir = FileManager.default.temporaryDirectory
        let dmgPath = tempDir.appendingPathComponent("SkillVault-update.dmg")

        if FileManager.default.fileExists(atPath: dmgPath.path) {
            try? FileManager.default.removeItem(at: dmgPath)
        }

        let task = URLSession.shared.downloadTask(with: url) { tempUrl, _, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            guard let tempUrl = tempUrl else {
                completion(.failure(NSError(domain: "UpdateManager", code: 4, userInfo: [NSLocalizedDescriptionKey: "Download failed"])))
                return
            }
            do {
                try FileManager.default.moveItem(at: tempUrl, to: dmgPath)
                let config = NSWorkspace.OpenConfiguration()
                NSWorkspace.shared.open(dmgPath, configuration: config)
                completion(.success(()))
            } catch {
                completion(.failure(error))
            }
        }
        task.resume()
    }

    func skipVersion(_ version: String) {
        userDefaults.set(version, forKey: skippedVersionKey)
    }

    func shouldAutoCheck() -> Bool {
        let lastCheck = userDefaults.double(forKey: lastCheckKey)
        guard lastCheck > 0 else { return true }
        return Date().timeIntervalSince1970 - lastCheck > 86400
    }

    private func findDmgAssetUrl(from json: [String: Any]) -> String? {
        guard let assets = json["assets"] as? [[String: Any]] else { return nil }
        for asset in assets {
            if let name = asset["name"] as? String, name.hasSuffix(".dmg"),
               let url = asset["browser_download_url"] as? String {
                return url
            }
        }
        return nil
    }

    private func isVersion(_ v1: String, newerThan v2: String) -> Bool {
        let parts1 = v1.split(separator: ".").compactMap { Int($0) }
        let parts2 = v2.split(separator: ".").compactMap { Int($0) }
        for i in 0..<max(parts1.count, parts2.count) {
            let p1 = i < parts1.count ? parts1[i] : 0
            let p2 = i < parts2.count ? parts2[i] : 0
            if p1 > p2 { return true }
            if p1 < p2 { return false }
        }
        return false
    }
}

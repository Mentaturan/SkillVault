import Foundation

enum ServerError: Error, LocalizedError {
    case message(String)
    var errorDescription: String? {
        switch self {
        case .message(let text): return text
        }
    }
}

class ServerManager {
    private var process: Process?
    private var port: Int = 0

    static var applicationSupportDirectory: String {
        let paths = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)
        let appSupport = paths.first!.path
        let dir = (appSupport as NSString).appendingPathComponent("SkillVault")
        try? FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
        return dir
    }

    private var serverPath: String {
        let bundle = Bundle.main.bundlePath
        return (bundle as NSString).appendingPathComponent("Contents/Server")
    }

    private var nodePath: String {
        let candidates = [
            "/opt/homebrew/bin/node",
            "/usr/local/bin/node",
            "/usr/bin/node",
        ]
        for path in candidates {
            if FileManager.default.isExecutableFile(atPath: path) {
                return path
            }
        }
        let which = Process()
        which.executableURL = URL(fileURLWithPath: "/usr/bin/which")
        which.arguments = ["node"]
        let pipe = Pipe()
        which.standardOutput = pipe
        try? which.run()
        which.waitUntilExit()
        if which.terminationStatus == 0 {
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            if let path = String(data: data, encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines), !path.isEmpty {
                return path
            }
        }
        return "/usr/local/bin/node"
    }

    func startServer(dbPath: String, completion: @escaping (Result<Int, Error>) -> Void) {
        port = findAvailablePort()

        let process = Process()
        process.executableURL = URL(fileURLWithPath: nodePath)

        let serverJS = (serverPath as NSString).appendingPathComponent("server.js")
        process.arguments = [serverJS]

        var environment = ProcessInfo.processInfo.environment
        environment["PORT"] = String(port)
        environment["SKILLVAULT_DB_PATH"] = dbPath
        environment["HOSTNAME"] = "localhost"
        process.environment = environment

        process.currentDirectoryURL = URL(fileURLWithPath: serverPath)

        let pipe = Pipe()
        process.standardOutput = pipe
        process.standardError = pipe

        do {
            try process.run()
            self.process = process

            waitForServer(port: port, completion: completion)
        } catch {
            completion(.failure(ServerError.message("无法启动 Node.js 服务: \(error.localizedDescription)\n\n请确认已安装 Node.js (node --version)")))
        }
    }

    func stopServer() {
        if let process = process, process.isRunning {
            process.terminate()
        }
    }

    private func findAvailablePort() -> Int {
        let sock = socket(AF_INET, SOCK_STREAM, 0)
        var addr = sockaddr_in()
        addr.sin_len = UInt8(MemoryLayout<sockaddr_in>.size)
        addr.sin_family = sa_family_t(AF_INET)
        addr.sin_port = 0
        addr.sin_addr = in_addr(s_addr: inet_addr("127.0.0.1"))

        let bindResult = withUnsafePointer(to: &addr) { ptr in
            ptr.withMemoryRebound(to: sockaddr.self, capacity: 1) { sockPtr in
                bind(sock, sockPtr, socklen_t(MemoryLayout<sockaddr_in>.size))
            }
        }

        if bindResult == 0 {
            var addrLen = socklen_t(MemoryLayout<sockaddr_in>.size)
            var boundAddr = sockaddr_in()
            withUnsafeMutablePointer(to: &boundAddr) { ptr in
                ptr.withMemoryRebound(to: sockaddr.self, capacity: 1) { sockPtr in
                    getsockname(sock, sockPtr, &addrLen)
                }
            }
            close(sock)
            return Int(boundAddr.sin_port).byteSwapped
        }

        close(sock)
        return 3456
    }

    private func waitForServer(port: Int, completion: @escaping (Result<Int, Error>) -> Void) {
        let maxAttempts = 60
        var attempts = 0

        func check() {
            attempts += 1

            if let process = self.process, !process.isRunning {
                completion(.failure(ServerError.message("Node.js 服务意外退出")))
                return
            }

            let url = URL(string: "http://localhost:\(port)")!
            var request = URLRequest(url: url)
            request.timeoutInterval = 2
            request.httpMethod = "HEAD"

            let task = URLSession.shared.dataTask(with: request) { _, response, _ in
                if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode < 500 {
                    completion(.success(port))
                } else if attempts < maxAttempts {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5, execute: { check() })
                } else {
                    completion(.failure(ServerError.message("服务启动超时（\(maxAttempts * 500)ms）")))
                }
            }
            task.resume()
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5, execute: { check() })
    }
}

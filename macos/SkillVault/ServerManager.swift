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
    private var pid: pid_t = 0
    private var port: Int = 0

    static var applicationSupportDirectory: String {
        let paths = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)
        let appSupport = paths.first!.path
        let dir = (appSupport as NSString).appendingPathComponent("SkillVault")
        try? FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
        return dir
    }

    static var logFilePath: String {
        return (applicationSupportDirectory as NSString).appendingPathComponent("launcher.log")
    }

    static func log(_ message: String) {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        let timestamp = formatter.string(from: Date())
        let line = "[\(timestamp)] \(message)\n"
        guard let data = line.data(using: .utf8) else { return }
        if let handle = try? FileHandle(forWritingTo: URL(fileURLWithPath: logFilePath)) {
            handle.seekToEndOfFile()
            handle.write(data)
            handle.closeFile()
        } else {
            try? data.write(to: URL(fileURLWithPath: logFilePath), options: .atomic)
        }
    }

    private var serverPath: String {
        let bundle = Bundle.main.bundlePath
        return (bundle as NSString).appendingPathComponent("Contents/Server")
    }

    private var bundledNodePath: String {
        return (Bundle.main.bundlePath as NSString).appendingPathComponent("Contents/Frameworks/node")
    }

    private var appSupportNodePath: String {
        return (ServerManager.applicationSupportDirectory as NSString).appendingPathComponent("node")
    }

    private func findNode() -> String? {
        ServerManager.log("findNode: starting search...")

        if FileManager.default.fileExists(atPath: appSupportNodePath) {
            ServerManager.log("findNode: found at Application Support: \(appSupportNodePath)")
            return appSupportNodePath
        }
        ServerManager.log("findNode: not at Application Support")

        if FileManager.default.fileExists(atPath: bundledNodePath) {
            ServerManager.log("findNode: found in bundle: \(bundledNodePath), deploying to Application Support...")
            deployBundledNode()
            if FileManager.default.fileExists(atPath: appSupportNodePath) {
                ServerManager.log("findNode: deployed successfully to \(appSupportNodePath)")
                return appSupportNodePath
            }
            ServerManager.log("findNode: deployment failed, trying bundle path directly")
            return bundledNodePath
        }
        ServerManager.log("findNode: not in bundle")

        let candidates = [
            "/opt/homebrew/bin/node",
            "/usr/local/bin/node",
            "/usr/bin/node",
        ]
        for path in candidates {
            let resolved = (path as NSString).resolvingSymlinksInPath
            if FileManager.default.fileExists(atPath: resolved) {
                ServerManager.log("findNode: found at system path: \(resolved)")
                return resolved
            }
            if FileManager.default.fileExists(atPath: path) {
                ServerManager.log("findNode: found at system path: \(path)")
                return path
            }
        }

        let home = NSHomeDirectory()
        let nvmDir = "\(home)/.nvm/versions/node"
        if let contents = try? FileManager.default.contentsOfDirectory(atPath: nvmDir) {
            for dir in contents.sorted().reversed() {
                let p = "\(nvmDir)/\(dir)/bin/node"
                if FileManager.default.fileExists(atPath: p) {
                    ServerManager.log("findNode: found at nvm path: \(p)")
                    return p
                }
            }
        }

        ServerManager.log("findNode: no node found anywhere")
        return nil
    }

    private func deployBundledNode() {
        do {
            let src = bundledNodePath
            let dst = appSupportNodePath
            if FileManager.default.fileExists(atPath: dst) {
                try FileManager.default.removeItem(atPath: dst)
            }
            try FileManager.default.copyItem(atPath: src, toPath: dst)
            chmod(dst, 0o755)
            ServerManager.log("deployBundledNode: copied \(src) -> \(dst)")
        } catch {
            ServerManager.log("deployBundledNode: failed: \(error.localizedDescription)")
        }
    }

    func startServer(dbPath: String, completion: @escaping (Result<Int, Error>) -> Void) {
        ServerManager.log("startServer: beginning...")
        ServerManager.log("startServer: bundle path = \(Bundle.main.bundlePath)")
        ServerManager.log("startServer: serverPath = \(serverPath)")

        guard let node = findNode() else {
            let msg = "未找到 Node.js。\n\n请安装 Node.js:\n  brew install node\n或访问 https://nodejs.org\n\n日志: \(ServerManager.logFilePath)"
            ServerManager.log("startServer: \(msg)")
            completion(.failure(ServerError.message(msg)))
            return
        }

        port = findAvailablePort()
        let serverJS = (serverPath as NSString).appendingPathComponent("server.js")

        ServerManager.log("startServer: node=\(node)")
        ServerManager.log("startServer: serverJS=\(serverJS)")
        ServerManager.log("startServer: port=\(port)")
        ServerManager.log("startServer: dbPath=\(dbPath)")

        var environment = ProcessInfo.processInfo.environment
        environment["PORT"] = String(port)
        environment["SKILLVAULT_DB_PATH"] = dbPath
        environment["HOSTNAME"] = "localhost"

        let envArray = environment.map { "\($0.key)=\($0.value)" }

        let result = spawnNode(nodePath: node, args: [serverJS], env: envArray, cwd: serverPath)

        switch result {
        case .success(let spawnedPid):
            self.pid = spawnedPid
            ServerManager.log("startServer: spawned node with pid \(spawnedPid)")
            waitForServer(port: port, completion: completion)
        case .failure(let error):
            let msg = "无法启动 Node.js 服务: \(error.localizedDescription)\n\n日志: \(ServerManager.logFilePath)"
            ServerManager.log("startServer: spawn failed: \(error.localizedDescription)")
            completion(.failure(ServerError.message(msg)))
        }
    }

    private func spawnNode(nodePath: String, args: [String], env: [String], cwd: String) -> Result<pid_t, Error> {
        let logPath = ServerManager.logFilePath
        let logFD = open(logPath, O_WRONLY | O_APPEND | O_CREAT, 0o644)

        var fileActions: posix_spawn_file_actions_t?
        posix_spawn_file_actions_init(&fileActions)

        posix_spawn_file_actions_adddup2(&fileActions, logFD, STDOUT_FILENO)
        posix_spawn_file_actions_adddup2(&fileActions, logFD, STDERR_FILENO)
        posix_spawn_file_actions_addchdir_np(&fileActions, cwd)

        var attr: posix_spawnattr_t?
        posix_spawnattr_init(&attr)

        var flags: Int16 = 0
        posix_spawnattr_getflags(&attr, &flags)
        flags |= Int16(POSIX_SPAWN_SETSIGMASK)
        var mask = sigset_t()
        sigemptyset(&mask)
        posix_spawnattr_setsigmask(&attr, &mask)
        posix_spawnattr_setflags(&attr, flags)

        var childPid: pid_t = 0

        let cArgs = ([nodePath] + args).map { strdup($0) } + [nil]
        let cEnv = env.map { strdup($0) } + [nil]

        ServerManager.log("spawnNode: cwd=\(cwd)")
        ServerManager.log("spawnNode: args=\(([nodePath] + args).joined(separator: " "))")

        let spawnResult = posix_spawn(&childPid, nodePath, &fileActions, &attr, cArgs, cEnv)

        for p in cArgs { if let p = p { free(p) } }
        for p in cEnv { if let p = p { free(p) } }

        if logFD >= 0 { close(logFD) }
        posix_spawn_file_actions_destroy(&fileActions)
        posix_spawnattr_destroy(&attr)

        if spawnResult != 0 {
            ServerManager.log("spawnNode: posix_spawn failed with error \(spawnResult): \(String(cString: strerror(spawnResult)))")
            return .failure(ServerError.message("posix_spawn 失败 (errno \(spawnResult)): \(String(cString: strerror(spawnResult)))"))
        }

        ServerManager.log("spawnNode: spawned pid \(childPid)")
        return .success(childPid)
    }

    func stopServer() {
        if pid > 0 {
            kill(pid, SIGTERM)
            ServerManager.log("stopServer: sent SIGTERM to pid \(pid)")
            pid = 0
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
                    _ = getsockname(sock, sockPtr, &addrLen)
                }
            }
            close(sock)
            return Int(boundAddr.sin_port.byteSwapped)
        }

        close(sock)
        return 3456
    }

    private func waitForServer(port: Int, completion: @escaping (Result<Int, Error>) -> Void) {
        let maxAttempts = 60
        var attempts = 0

        func check() {
            attempts += 1

            if pid > 0 {
                var status: Int32 = 0
                let result = waitpid(pid, &status, WNOHANG)
                if result > 0 {
                    ServerManager.log("waitForServer: node process exited (waitpid result=\(result), status=\(status))")
                    completion(.failure(ServerError.message("Node.js 服务意外退出 (exit code \(status))\n\n日志: \(ServerManager.logFilePath)")))
                    return
                }
            }

            let url = URL(string: "http://localhost:\(port)")!
            var request = URLRequest(url: url)
            request.timeoutInterval = 2
            request.httpMethod = "HEAD"

            let task = URLSession.shared.dataTask(with: request) { _, response, _ in
                if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode < 500 {
                    ServerManager.log("waitForServer: server ready on port \(port)")
                    completion(.success(port))
                } else if attempts < maxAttempts {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5, execute: { check() })
                } else {
                    ServerManager.log("waitForServer: timed out after \(maxAttempts) attempts")
                    completion(.failure(ServerError.message("服务启动超时（\(maxAttempts * 500)ms）\n\n日志: \(ServerManager.logFilePath)")))
                }
            }
            task.resume()
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5, execute: { check() })
    }
}

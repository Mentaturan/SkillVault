import Cocoa
import WebKit

class AppDelegate: NSObject, NSApplicationDelegate {
    var window: NSWindow!
    var webView: WKWebView!
    let serverManager = ServerManager()
    let bonjourService = BonjourService()

    let windowWidth: CGFloat = 1280
    let windowHeight: CGFloat = 800
    let minWindowWidth: CGFloat = 1024
    let minWindowHeight: CGFloat = 768

    func applicationDidFinishLaunching(_ notification: Notification) {
        let supportDir = ServerManager.applicationSupportDirectory
        let dbPath = (supportDir as NSString).appendingPathComponent("skillvault.sqlite")

        serverManager.startServer(dbPath: dbPath) { [weak self] (result: Result<Int, Error>) in
            DispatchQueue.main.async(execute: {
                switch result {
                case .success(let port):
                    self?.createWindow(port: port)
                case .failure(let error):
                    self?.showErrorAndQuit(error: error.localizedDescription)
                }
            })
        }
    }

    func applicationWillTerminate(_ notification: Notification) {
        bonjourService.stop()
        serverManager.stopServer()
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }

    func createWindow(port: Int) {
        bonjourService.start(port: port)
        let frame = savedWindowFrame()
        window = NSWindow(
            contentRect: frame,
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "SkillVault"
        window.minSize = NSSize(width: minWindowWidth, height: minWindowHeight)
        window.delegate = self

        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.preferences.javaScriptCanOpenWindowsAutomatically = true

        webView = WKWebView(frame: .zero, configuration: config)
        webView.uiDelegate = self
        webView.customUserAgent = "SkillVault/1.0.0"
        webView.navigationDelegate = self

        let loadingHTML = """
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><style>
        body{display:flex;align-items:center;justify-content:center;height:100vh;margin:0;
        font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#888}
        .spinner{width:32px;height:32px;border:3px solid #e5e5e5;border-top-color:#888;
        border-radius:50%;animation:spin .8s linear infinite;margin-right:12px}
        @keyframes spin{to{transform:rotate(360deg)}}
        </style></head><body><div class="spinner"></div>正在启动 SkillVault…</body></html>
        """
        webView.loadHTMLString(loadingHTML, baseURL: nil)

        window.contentView = webView
        window.makeKeyAndOrderFront(nil)

        let url = URL(string: "http://localhost:\(port)")!
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            let request = URLRequest(url: url)
            self.webView.load(request)
        }
    }

    func showErrorAndQuit(error: String) {
        let alert = NSAlert()
        alert.messageText = "SkillVault 启动失败"
        alert.informativeText = error
        alert.addButton(withTitle: "退出")
        alert.runModal()
        NSApplication.shared.terminate(nil)
    }

    private func savedWindowFrame() -> NSRect {
        let defaults = UserDefaults.standard
        guard let x = defaults.object(forKey: "windowX") as? CGFloat,
              let y = defaults.object(forKey: "windowY") as? CGFloat,
              let w = defaults.object(forKey: "windowW") as? CGFloat,
              let h = defaults.object(forKey: "windowH") as? CGFloat else {
            let screen = NSScreen.main?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1440, height: 900)
            return NSRect(
                x: screen.midX - windowWidth / 2,
                y: screen.midY - windowHeight / 2,
                width: windowWidth,
                height: windowHeight
            )
        }
        return NSRect(x: x, y: y, width: w, height: h)
    }

    private func saveWindowFrame() {
        guard let window = window else { return }
        let defaults = UserDefaults.standard
        defaults.set(window.frame.origin.x, forKey: "windowX")
        defaults.set(window.frame.origin.y, forKey: "windowY")
        defaults.set(window.frame.size.width, forKey: "windowW")
        defaults.set(window.frame.size.height, forKey: "windowH")
    }
}

extension AppDelegate: WKUIDelegate {
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = navigationAction.request.url {
            if url.host != "localhost" && url.host != "127.0.0.1" {
                NSWorkspace.shared.open(url)
                return nil
            }
        }
        return nil
    }
}

extension AppDelegate: WKNavigationDelegate {
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let url = navigationAction.request.url {
            if url.scheme == "http" || url.scheme == "https" {
                if url.host == "localhost" || url.host == "127.0.0.1" {
                    decisionHandler(.allow)
                    return
                }
                if navigationAction.navigationType == .linkActivated {
                    NSWorkspace.shared.open(url)
                    decisionHandler(.cancel)
                    return
                }
            }
        }
        decisionHandler(.allow)
    }
}

extension AppDelegate: NSWindowDelegate {
    func windowDidResize(_ notification: Notification) { saveWindowFrame() }
    func windowDidMove(_ notification: Notification) { saveWindowFrame() }
}

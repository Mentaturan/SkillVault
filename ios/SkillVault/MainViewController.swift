import UIKit
import WebKit

class MainViewController: UIViewController {
    private let serverDiscovery: ServerDiscovery
    private var webView: WKWebView?
    private var connectedServer: DiscoveredServer?

    private let tableView = UITableView(frame: .zero, style: .plain)
    private let emptyLabel = UILabel()
    private let backButton = UIButton(type: .system)

    init(serverDiscovery: ServerDiscovery) {
        self.serverDiscovery = serverDiscovery
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        serverDiscovery.delegate = self
        updateUI()
    }

    private func setupUI() {
        view.backgroundColor = .systemBackground
        navigationItem.title = "SkillVault"

        tableView.translatesAutoresizingMaskIntoConstraints = false
        tableView.dataSource = self
        tableView.delegate = self
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "ServerCell")
        tableView.isHidden = true
        view.addSubview(tableView)

        emptyLabel.translatesAutoresizingMaskIntoConstraints = false
        emptyLabel.text = "未发现桌面端实例\n\n请确保 SkillVault 桌面端已启动，\n且与本设备处于同一 WiFi 网络。"
        emptyLabel.numberOfLines = 0
        emptyLabel.textAlignment = .center
        emptyLabel.textColor = .secondaryLabel
        emptyLabel.font = .preferredFont(forTextStyle: .body)
        emptyLabel.isHidden = true
        view.addSubview(emptyLabel)

        backButton.translatesAutoresizingMaskIntoConstraints = false
        backButton.setTitle("← 返回服务器列表", for: .normal)
        backButton.addTarget(self, action: #selector(disconnectServer), for: .touchUpInside)
        backButton.isHidden = true
        view.addSubview(backButton)

        NSLayoutConstraint.activate([
            tableView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            emptyLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            emptyLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            emptyLabel.leadingAnchor.constraint(greaterThanOrEqualTo: view.leadingAnchor, constant: 40),
            emptyLabel.trailingAnchor.constraint(lessThanOrEqualTo: view.trailingAnchor, constant: -40),

            backButton.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 8),
            backButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
        ])
    }

    private func updateUI() {
        let isConnected = connectedServer != nil
        let hasServers = !serverDiscovery.servers.isEmpty

        tableView.isHidden = isConnected || !hasServers
        emptyLabel.isHidden = isConnected || hasServers
        backButton.isHidden = !isConnected

        if !isConnected {
            webView?.removeFromSuperview()
            webView = nil
            navigationItem.title = "SkillVault"
        }

        tableView.reloadData()
    }

    private func connect(to server: DiscoveredServer) {
        connectedServer = server
        navigationItem.title = server.name

        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.dataDetectorTypes = []

        let wv = WKWebView(frame: .zero, configuration: config)
        wv.navigationDelegate = self
        wv.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(wv)
        webView = wv

        NSLayoutConstraint.activate([
            wv.topAnchor.constraint(equalTo: backButton.bottomAnchor, constant: 4),
            wv.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            wv.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            wv.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])

        let urlString = "http://\(server.host):\(server.port)"
        if let url = URL(string: urlString) {
            wv.load(URLRequest(url: url))
        }

        updateUI()
    }

    @objc private func disconnectServer() {
        connectedServer = nil
        updateUI()
    }
}

extension MainViewController: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return serverDiscovery.servers.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "ServerCell", for: indexPath)
        let server = serverDiscovery.servers[indexPath.row]
        var config = cell.defaultContentConfiguration()
        config.text = server.name
        config.secondaryText = "\(server.host):\(server.port)"
        cell.contentConfiguration = config
        cell.accessoryType = .disclosureIndicator
        return cell
    }
}

extension MainViewController: UITableViewDelegate {
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        let server = serverDiscovery.servers[indexPath.row]
        connect(to: server)
    }
}

extension MainViewController: ServerDiscoveryDelegate {
    func serverDiscoveryDidFindServer(_ discovery: ServerDiscovery) {
        DispatchQueue.main.async { self.updateUI() }
    }

    func serverDiscoveryDidRemoveServer(_ discovery: ServerDiscovery) {
        DispatchQueue.main.async {
            if let connected = self.connectedServer,
               !discovery.servers.contains(where: { $0.name == connected.name }) {
                self.connectedServer = nil
            }
            self.updateUI()
        }
    }
}

extension MainViewController: WKNavigationDelegate {
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url,
              let host = url.host else {
            decisionHandler(.allow)
            return
        }

        if url.scheme == "http" || url.scheme == "https" {
            if let server = connectedServer,
               (host == server.host || host == "localhost" || host == "127.0.0.1") {
                decisionHandler(.allow)
                return
            }
            if navigationAction.navigationType == .linkActivated {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }
        }

        decisionHandler(.allow)
    }
}

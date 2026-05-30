import Foundation

protocol ServerDiscoveryDelegate: AnyObject {
    func serverDiscoveryDidFindServer(_ discovery: ServerDiscovery)
    func serverDiscoveryDidRemoveServer(_ discovery: ServerDiscovery)
}

struct DiscoveredServer {
    let name: String
    let host: String
    let port: Int
}

class ServerDiscovery: NSObject {
    weak var delegate: ServerDiscoveryDelegate?
    private(set) var servers: [DiscoveredServer] = []
    private var browser: NetServiceBrowser?
    private var resolvingServices: [NetService] = []

    override init() {
        super.init()
        startBrowsing()
    }

    deinit {
        stopBrowsing()
    }

    func startBrowsing() {
        browser = NetServiceBrowser()
        browser?.delegate = self
        browser?.searchForServices(ofType: "_skillvault._tcp.", inDomain: "local.")
    }

    func stopBrowsing() {
        browser?.stop()
        browser = nil
    }
}

extension ServerDiscovery: NetServiceBrowserDelegate {
    func netServiceBrowser(_ browser: NetServiceBrowser, didFind service: NetService, moreComing: Bool) {
        resolvingServices.append(service)
        service.delegate = self
        service.resolve(withTimeout: 5.0)
    }

    func netServiceBrowser(_ browser: NetServiceBrowser, didRemove service: NetService, moreComing: Bool) {
        if let index = resolvingServices.firstIndex(of: service) {
            resolvingServices.remove(at: index)
        }
        servers.removeAll { $0.name == service.name }
        delegate?.serverDiscoveryDidRemoveServer(self)
    }

    func netServiceBrowser(_ browser: NetServiceBrowser, didNotSearch errorDict: [String: NSNumber]) {
        browser.stop()
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            self?.startBrowsing()
        }
    }
}

extension ServerDiscovery: NetServiceDelegate {
    func netServiceDidResolveAddress(_ sender: NetService) {
        let host = sender.hostName ?? ""
        let port = sender.port
        let name = sender.name

        guard !host.isEmpty, port > 0 else { return }

        if !servers.contains(where: { $0.name == name }) {
            let server = DiscoveredServer(name: name, host: host, port: port)
            servers.append(server)
            delegate?.serverDiscoveryDidFindServer(self)
        }

        if let index = resolvingServices.firstIndex(of: sender) {
            resolvingServices.remove(at: index)
        }
    }

    func netService(_ sender: NetService, didNotResolve errorDict: [String: NSNumber]) {
        if let index = resolvingServices.firstIndex(of: sender) {
            resolvingServices.remove(at: index)
        }
    }
}

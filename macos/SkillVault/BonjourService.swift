import Foundation

class BonjourService: NSObject, NetServiceDelegate {
    private var service: NetService?

    func start(port: Int) {
        let hostName = Host.current().localizedName ?? "Unknown"
        let serviceName = "SkillVault on \(hostName)"

        service = NetService(domain: "", type: "_skillvault._tcp.", name: serviceName, port: Int32(port))
        service?.delegate = self
        service?.publish(options: .listenForConnections)
        ServerManager.log("BonjourService: broadcasting \"\(serviceName)\" on port \(port)")
    }

    func stop() {
        service?.stop()
        service = nil
        ServerManager.log("BonjourService: stopped broadcasting")
    }

    func netServiceDidPublish(_ sender: NetService) {
        ServerManager.log("BonjourService: published \(sender.name)")
    }

    func netService(_ sender: NetService, didNotPublish errorDict: [String: NSNumber]) {
        ServerManager.log("BonjourService: publish failed \(errorDict)")
    }
}

import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        let appDelegate = UIApplication.shared.delegate as? AppDelegate
        let serverDiscovery = appDelegate?.serverDiscovery ?? ServerDiscovery()
        let mainVC = MainViewController(serverDiscovery: serverDiscovery)
        let navController = UINavigationController(rootViewController: mainVC)

        let window = UIWindow(windowScene: windowScene)
        window.rootViewController = navController
        self.window = window
        window.makeKeyAndVisible()
    }
}

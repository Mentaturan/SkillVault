using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using System.Threading;
using System.Threading.Tasks;

namespace SkillVault;

class ServerManager
{
    private Process? _nodeProcess;
    private int _port;

    public static string AppDataDirectory
    {
        get
        {
            var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "SkillVault");
            Directory.CreateDirectory(dir);
            return dir;
        }
    }

    public static string LogFilePath => Path.Combine(AppDataDirectory, "launcher.log");

    public static void Log(string message)
    {
        var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        var line = $"[{timestamp}] {message}{Environment.NewLine}";
        try
        {
            File.AppendAllText(LogFilePath, line);
        }
        catch { }
    }

    private static string AppDataNodePath => Path.Combine(AppDataDirectory, "node.exe");

    private static string BundledNodePath => Path.Combine(AppContext.BaseDirectory, "node.exe");

    private string ServerPath => Path.Combine(AppContext.BaseDirectory, "Server");

    private string? FindNode()
    {
        Log("FindNode: starting search...");

        if (File.Exists(AppDataNodePath))
        {
            Log($"FindNode: found at AppData: {AppDataNodePath}");
            return AppDataNodePath;
        }
        Log("FindNode: not at AppData");

        if (File.Exists(BundledNodePath))
        {
            Log($"FindNode: found bundled: {BundledNodePath}, deploying to AppData...");
            DeployBundledNode();
            if (File.Exists(AppDataNodePath))
            {
                Log($"FindNode: deployed successfully to {AppDataNodePath}");
                return AppDataNodePath;
            }
            Log("FindNode: deployment failed, using bundled path directly");
            return BundledNodePath;
        }
        Log("FindNode: not bundled");

        var systemNode = FindOnPath("node.exe");
        if (systemNode != null)
        {
            Log($"FindNode: found on PATH: {systemNode}");
            return systemNode;
        }

        Log("FindNode: no node found anywhere");
        return null;
    }

    private static void DeployBundledNode()
    {
        try
        {
            if (File.Exists(AppDataNodePath))
                File.Delete(AppDataNodePath);
            File.Copy(BundledNodePath, AppDataNodePath);
            Log($"DeployBundledNode: copied {BundledNodePath} -> {AppDataNodePath}");
        }
        catch (Exception ex)
        {
            Log($"DeployBundledNode: failed: {ex.Message}");
        }
    }

    private static string? FindOnPATH(string fileName)
    {
        var pathEnv = Environment.GetEnvironmentVariable("PATH");
        if (pathEnv == null) return null;

        foreach (var dir in pathEnv.Split(Path.PathSeparator))
        {
            var fullPath = Path.Combine(dir.Trim(), fileName);
            if (File.Exists(fullPath))
                return fullPath;
        }
        return null;
    }

    public async Task<int> StartServerAsync(string dbPath, CancellationToken cancellationToken = default)
    {
        Log("StartServer: beginning...");
        Log($"StartServer: base path = {AppContext.BaseDirectory}");
        Log($"StartServer: serverPath = {ServerPath}");

        var node = FindNode();
        if (node == null)
        {
            var msg = $"\u672a\u627e\u5230 Node.js\u3002\n\n\u8bf7\u5b89\u88c5 Node.js: https://nodejs.org\n\n\u65e5\u5fd7: {LogFilePath}";
            Log($"StartServer: {msg}");
            throw new Exception(msg);
        }

        _port = FindAvailablePort();
        var serverJS = Path.Combine(ServerPath, "server.js");

        Log($"StartServer: node={node}");
        Log($"StartServer: serverJS={serverJS}");
        Log($"StartServer: port={_port}");
        Log($"StartServer: dbPath={dbPath}");

        SpawnNode(node, serverJS, dbPath);
        await WaitForServerAsync(cancellationToken);

        Log($"StartServer: server ready on port {_port}");
        return _port;
    }

    private void SpawnNode(string nodePath, string serverJS, string dbPath)
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = nodePath,
            Arguments = $"\"{serverJS}\"",
            WorkingDirectory = ServerPath,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true
        };

        startInfo.EnvironmentVariables["PORT"] = _port.ToString();
        startInfo.EnvironmentVariables["SKILLVAULT_DB_PATH"] = dbPath;
        startInfo.EnvironmentVariables["HOSTNAME"] = "localhost";
        startInfo.EnvironmentVariables["SKILLVAULT_SEED_ON_EMPTY"] = "1";

        try
        {
            _nodeProcess = new Process { StartInfo = startInfo };

            _nodeProcess.OutputDataReceived += (_, e) =>
            {
                if (e.Data != null) Log($"[node:out] {e.Data}");
            };
            _nodeProcess.ErrorDataReceived += (_, e) =>
            {
                if (e.Data != null) Log($"[node:err] {e.Data}");
            };

            _nodeProcess.Start();
            _nodeProcess.BeginOutputReadLine();
            _nodeProcess.BeginErrorReadLine();

            Log($"SpawnNode: spawned node with pid {_nodeProcess.Id}");
        }
        catch (Exception ex)
        {
            var msg = $"\u65e0\u6cd5\u542f\u52a8 Node.js \u670d\u52a1: {ex.Message}\n\n\u65e5\u5fd7: {LogFilePath}";
            Log($"SpawnNode: failed: {ex.Message}");
            throw new Exception(msg);
        }
    }

    public void StopServer()
    {
        if (_nodeProcess != null && !_nodeProcess.HasExited)
        {
            try
            {
                _nodeProcess.Kill(entireProcessTree: true);
                Log($"StopServer: killed node process tree pid {_nodeProcess.Id}");
            }
            catch (Exception ex)
            {
                Log($"StopServer: kill failed: {ex.Message}");
            }
            _nodeProcess = null;
        }
    }

    private static int FindAvailablePort()
    {
        var listener = new TcpListener(IPAddress.Loopback, 0);
        try
        {
            listener.Start();
            var port = ((IPEndPoint)listener.LocalEndpoint).Port;
            return port;
        }
        finally
        {
            listener.Stop();
        }
    }

    private async Task WaitForServerAsync(CancellationToken cancellationToken)
    {
        const int maxAttempts = 60;
        using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(2) };

        for (var attempt = 0; attempt < maxAttempts; attempt++)
        {
            if (_nodeProcess != null && _nodeProcess.HasExited)
            {
                var exitCode = _nodeProcess.ExitCode;
                Log($"WaitForServer: node process exited (exit code {exitCode})");
                throw new Exception($"Node.js \u670d\u52a1\u610f\u5916\u9000\u51fa (exit code {exitCode})\n\n\u65e5\u5fd7: {LogFilePath}");
            }

            try
            {
                var request = new HttpRequestMessage(HttpMethod.Head, $"http://localhost:{_port}");
                using var response = await httpClient.SendAsync(request, cancellationToken);
                if (response.StatusCode < HttpStatusCode.InternalServerError)
                {
                    Log($"WaitForServer: server ready on port {_port}");
                    return;
                }
            }
            catch (HttpRequestException) { }
            catch (TaskCanceledException) { }

            await Task.Delay(500, cancellationToken);
        }

        Log($"WaitForServer: timed out after {maxAttempts} attempts");
        throw new Exception($"\u670d\u52a1\u542f\u52a8\u8d85\u65f6\uff08{maxAttempts * 500}ms\uff09\n\n\u65e5\u5fd7: {LogFilePath}");
    }
}

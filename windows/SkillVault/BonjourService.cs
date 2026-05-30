using System;
using Makaretu.Dns;

namespace SkillVault;

class BonjourService : IDisposable
{
    private ServiceDiscovery? _discovery;
    private ServiceProfile? _profile;

    public void Start(int port)
    {
        try
        {
            var instanceName = $"SkillVault on {Environment.MachineName}";
            _profile = new ServiceProfile(instanceName, "_skillvault._tcp", (ushort)port);
            _discovery = new ServiceDiscovery();
            _discovery.Advertise(_profile);
            ServerManager.Log($"BonjourService: registered {instanceName} on port {port}");
        }
        catch (Exception ex)
        {
            ServerManager.Log($"BonjourService: start failed: {ex.Message}");
        }
    }

    public void Stop()
    {
        try
        {
            if (_discovery != null)
            {
                if (_profile != null)
                {
                    _discovery.Unadvertise(_profile);
                    ServerManager.Log($"BonjourService: unregistered {_profile.InstanceName}");
                }
                _discovery.Dispose();
                _discovery = null;
                _profile = null;
            }
        }
        catch (Exception ex)
        {
            ServerManager.Log($"BonjourService: stop failed: {ex.Message}");
        }
    }

    public void Dispose()
    {
        Stop();
        GC.SuppressFinalize(this);
    }
}

using System;
using System.Windows.Forms;

namespace SkillVault;

static class Program
{
    [STAThread]
    static void Main()
    {
        ApplicationConfiguration.Initialize();

        var serverManager = new ServerManager();
        var dbPath = System.IO.Path.Combine(ServerManager.AppDataDirectory, "skillvault.sqlite");

        using var form = new MainForm(serverManager, dbPath);
        Application.Run(form);
    }
}

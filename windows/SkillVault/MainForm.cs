using System;
using System.Drawing;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Win32;

namespace SkillVault;

class MainForm : Form
{
    private readonly ServerManager _serverManager;
    private readonly string _dbPath;
    private readonly Microsoft.Web.WebView2.WinForms.WebView2 _webView;
    private readonly BonjourService _bonjourService;
    private int _port;

    private const int DefaultWidth = 1280;
    private const int DefaultHeight = 800;
    private const int MinWidth = 1024;
    private const int MinHeight = 768;

    private const string LoadingHtml = @"<!DOCTYPE html>
<html><head><meta charset=""utf-8""><style>
body{display:flex;align-items:center;justify-content:center;height:100vh;margin:0;
font-family:Segoe UI,-apple-system,BlinkMacSystemFont,sans-serif;color:#888}
.spinner{width:32px;height:32px;border:3px solid #e5e5e5;border-top-color:#888;
border-radius:50%;animation:spin .8s linear infinite;margin-right:12px}
@keyframes spin{to{transform:rotate(360deg)}}
</style></head><body><div class=""spinner""></div>\u6b63\u5728\u542f\u52a8 SkillVault\u2026</body></html>";

    private const string ErrorHtmlTemplate = @"<!DOCTYPE html>
<html><head><meta charset=""utf-8""><style>
body{{display:flex;align-items:center;justify-content:center;height:100vh;margin:0;
font-family:Segoe UI,-apple-system,BlinkMacSystemFont,sans-serif;color:#c00;white-space:pre-wrap;padding:40px;box-sizing:border-box}}
</style></head><body>{0}</body></html>";

    public MainForm(ServerManager serverManager, string dbPath)
    {
        _serverManager = serverManager;
        _dbPath = dbPath;
        _bonjourService = new BonjourService();

        Text = "SkillVault";
        MinimumSize = new Size(MinWidth, MinHeight);
        LoadWindowPosition();

        _webView = new Microsoft.Web.WebView2.WinForms.WebView2
        {
            Dock = DockStyle.Fill
        };

        _webView.CoreWebView2InitializationCompleted += OnWebViewInitialized;
        _webView.NavigationStarting += OnNavigationStarting;

        Controls.Add(_webView);

        Load += async (_, _) => await InitializeAsync();
        FormClosing += OnFormClosing;
    }

    private async System.Threading.Tasks.Task InitializeAsync()
    {
        await _webView.EnsureCoreWebView2Async(null);
        _webView.CoreWebView2.Settings.UserAgent = "SkillVault/1.1.0";
        _webView.CoreWebView2.SetVirtualHostNameToFolderMapping("skillvault.loading", ".", CoreWebView2HostResourceAccessKind.Deny);
        _webView.NavigateToString(LoadingHtml);

        try
        {
            _port = await _serverManager.StartServerAsync(_dbPath);
            _bonjourService.Start(_port);
            _webView.CoreWebView2.Navigate($"http://localhost:{_port}");
        }
        catch (Exception ex)
        {
            _webView.NavigateToString(string.Format(ErrorHtmlTemplate, ex.Message));
        }
    }

    private void OnWebViewInitialized(object? sender, CoreWebView2InitializationCompletedEventArgs e)
    {
        if (!e.IsSuccess)
        {
            ServerManager.Log($"WebView2 init failed: {e.InitializationException?.Message}");
        }
    }

    private void OnNavigationStarting(object? sender, CoreWebView2NavigationStartingEventArgs e)
    {
        if (e.Uri == null) return;

        var uri = new Uri(e.Uri);
        if (uri.Scheme is "http" or "https")
        {
            if (uri.Host is "localhost" or "127.0.0.1")
                return;

            if (e.IsUserInitiated)
            {
                System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(e.Uri) { UseShellExecute = true });
                e.Cancel = true;
                return;
            }
        }
    }

    private void OnFormClosing(object? sender, FormClosingEventArgs e)
    {
        SaveWindowPosition();
        _bonjourService.Stop();
        _serverManager.StopServer();
    }

    private void LoadWindowPosition()
    {
        try
        {
            using var key = Registry.CurrentUser.CreateSubKey(@"Software\SkillVault");
            var x = (int?)key.GetValue("WindowX") ?? -1;
            var y = (int?)key.GetValue("WindowY") ?? -1;
            var w = (int?)key.GetValue("WindowW") ?? DefaultWidth;
            var h = (int?)key.GetValue("WindowH") ?? DefaultHeight;

            Size = new Size(w, h);

            if (x >= 0 && y >= 0)
            {
                StartPosition = FormStartPosition.Manual;
                Location = new Point(x, y);
            }
            else
            {
                StartPosition = FormStartPosition.CenterScreen;
            }
        }
        catch
        {
            Size = new Size(DefaultWidth, DefaultHeight);
            StartPosition = FormStartPosition.CenterScreen;
        }
    }

    private void SaveWindowPosition()
    {
        try
        {
            using var key = Registry.CurrentUser.CreateSubKey(@"Software\SkillVault");
            key.SetValue("WindowX", Location.X);
            key.SetValue("WindowY", Location.Y);
            key.SetValue("WindowW", Size.Width);
            key.SetValue("WindowH", Size.Height);
        }
        catch { }
    }
}

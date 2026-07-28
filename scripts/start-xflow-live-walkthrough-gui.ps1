$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$xflowSiteUrl = "https://xflowx.com"
$xflowDashboardUrl = "https://xflowx.com/overview"
$xflowGuidedTourUrl = "https://xflowx.com/help/ecosystem-guide?tour=1"
$verixetSiteUrl = "https://verixet.com"
$verixetDashboardUrl = "https://verixet.com/dashboard"
$walkthroughWorkspaceId = "4e3d926b-6ff1-42e2-aaee-f17a8559cf9c"
$walkthroughReturnTo = [Uri]::EscapeDataString($xflowGuidedTourUrl)
$walkthroughSignInUrl =
  "https://xflowx.com/auth/start?mode=signin&intent=signin&app=xflow" +
  "&selectedAppSlug=xflow&sourceApp=xflow" +
  "&returnTo=$walkthroughReturnTo" +
  "&desktop_workspace_id=$walkthroughWorkspaceId"
$verixetReturnTo = [Uri]::EscapeDataString($verixetDashboardUrl)
$verixetHandoffUrl =
  "https://xflowx.com/auth/start?mode=signin&intent=signin&app=verixet" +
  "&selectedAppSlug=verixet&sourceApp=verixet" +
  "&returnTo=$verixetReturnTo" +
  "&desktop_workspace_id=$walkthroughWorkspaceId"

$script:openedWalkthrough = $false

$createdNew = $false
$mutex = [Threading.Mutex]::new($true, "Local\XFlowLiveWalkthroughPanel", [ref]$createdNew)
if (-not $createdNew) {
  [System.Windows.Forms.MessageBox]::Show(
    "The live XFlow walkthrough panel is already open.",
    "XFlow Live Walkthrough",
    [System.Windows.Forms.MessageBoxButtons]::OK,
    [System.Windows.Forms.MessageBoxIcon]::Information
  ) | Out-Null
  exit 0
}

function Test-LiveSite {
  param([string]$Url)

  try {
    $request = [System.Net.HttpWebRequest]::Create($Url)
    $request.Method = "GET"
    $request.AllowAutoRedirect = $true
    $request.Timeout = 5000
    $request.ReadWriteTimeout = 5000
    $request.UserAgent = "XFlow-Walkthrough-Status/1.0"
    $response = $request.GetResponse()
    try {
      $statusCode = [int]$response.StatusCode
      return $statusCode -ge 200 -and $statusCode -lt 400
    } finally {
      $response.Dispose()
    }
  } catch {
    return $false
  }
}

function Open-Url {
  param([string]$Url)
  Start-Process $Url | Out-Null
}

function New-PanelButton {
  param(
    [string]$Text,
    [int]$Left,
    [int]$Width
  )

  $button = [System.Windows.Forms.Button]::new()
  $button.Text = $Text
  $button.Location = [System.Drawing.Point]::new($Left, 309)
  $button.Size = [System.Drawing.Size]::new($Width, 36)
  $button.FlatStyle = "Flat"
  $button.FlatAppearance.BorderColor = [System.Drawing.Color]::FromArgb(55, 91, 139)
  $button.BackColor = [System.Drawing.Color]::FromArgb(20, 48, 84)
  $button.ForeColor = [System.Drawing.Color]::White
  return $button
}

$form = [System.Windows.Forms.Form]::new()
$form.Text = "XFlow Live Walkthrough"
$form.StartPosition = "CenterScreen"
$form.Size = [System.Drawing.Size]::new(760, 410)
$form.MinimumSize = [System.Drawing.Size]::new(720, 390)
$form.BackColor = [System.Drawing.Color]::FromArgb(9, 17, 31)
$form.ForeColor = [System.Drawing.Color]::White
$form.Font = [System.Drawing.Font]::new("Segoe UI", 10)

$titleLabel = [System.Windows.Forms.Label]::new()
$titleLabel.Text = "Checking the live XFlow ecosystem..."
$titleLabel.Font = [System.Drawing.Font]::new("Segoe UI Semibold", 17)
$titleLabel.ForeColor = [System.Drawing.Color]::FromArgb(232, 242, 255)
$titleLabel.Location = [System.Drawing.Point]::new(24, 20)
$titleLabel.AutoSize = $true
$form.Controls.Add($titleLabel)

$helpLabel = [System.Windows.Forms.Label]::new()
$helpLabel.Text = "No local server or terminal is used. Start in XFlow at guided walkthrough step 1."
$helpLabel.ForeColor = [System.Drawing.Color]::FromArgb(151, 171, 200)
$helpLabel.Location = [System.Drawing.Point]::new(27, 58)
$helpLabel.AutoSize = $true
$form.Controls.Add($helpLabel)

$grid = [System.Windows.Forms.DataGridView]::new()
$grid.Location = [System.Drawing.Point]::new(27, 92)
$grid.Size = [System.Drawing.Size]::new(690, 166)
$grid.Anchor = "Top,Left,Right"
$grid.AllowUserToAddRows = $false
$grid.AllowUserToDeleteRows = $false
$grid.AllowUserToResizeRows = $false
$grid.ReadOnly = $true
$grid.RowHeadersVisible = $false
$grid.ColumnHeadersHeight = 34
$grid.RowTemplate.Height = 40
$grid.BackgroundColor = [System.Drawing.Color]::FromArgb(12, 25, 45)
$grid.BorderStyle = "None"
$grid.GridColor = [System.Drawing.Color]::FromArgb(35, 57, 86)
$grid.EnableHeadersVisualStyles = $false
$grid.ColumnHeadersDefaultCellStyle.BackColor = [System.Drawing.Color]::FromArgb(19, 39, 67)
$grid.ColumnHeadersDefaultCellStyle.ForeColor = [System.Drawing.Color]::FromArgb(210, 226, 247)
$grid.DefaultCellStyle.BackColor = [System.Drawing.Color]::FromArgb(12, 25, 45)
$grid.DefaultCellStyle.ForeColor = [System.Drawing.Color]::FromArgb(226, 237, 252)
$grid.DefaultCellStyle.SelectionBackColor = [System.Drawing.Color]::FromArgb(12, 25, 45)
$grid.DefaultCellStyle.SelectionForeColor = [System.Drawing.Color]::FromArgb(226, 237, 252)
$grid.Columns.Add("service", "Walkthrough item") | Out-Null
$grid.Columns.Add("status", "Status") | Out-Null
$grid.Columns.Add("address", "Live address") | Out-Null
$grid.Columns["service"].Width = 190
$grid.Columns["status"].Width = 130
$grid.Columns["address"].AutoSizeMode = "Fill"
$grid.Rows.Add("XFlow guided walkthrough", "Checking...", $xflowGuidedTourUrl) | Out-Null
$grid.Rows.Add("Connected Verixet app", "Checking...", $verixetDashboardUrl) | Out-Null
$grid.Rows.Add("Walkthrough start", "Waiting...", "XFlow sign-in -> guided tour step 1") | Out-Null
$form.Controls.Add($grid)

$nextLabel = [System.Windows.Forms.Label]::new()
$nextLabel.Text = "The live walkthrough will open automatically when both deployed sites respond."
$nextLabel.ForeColor = [System.Drawing.Color]::FromArgb(255, 204, 102)
$nextLabel.Location = [System.Drawing.Point]::new(27, 274)
$nextLabel.AutoSize = $true
$form.Controls.Add($nextLabel)

$openWalkthroughButton = New-PanelButton -Text "Start walkthrough - step 1" -Left 27 -Width 190
$openWalkthroughButton.Enabled = $false
$openWalkthroughButton.Add_Click({ Open-Url $walkthroughSignInUrl })
$form.Controls.Add($openWalkthroughButton)

$openXFlowButton = New-PanelButton -Text "Open XFlow overview" -Left 227 -Width 145
$openXFlowButton.Add_Click({ Open-Url $xflowDashboardUrl })
$form.Controls.Add($openXFlowButton)

$openVerixetButton = New-PanelButton -Text "Open connected Verixet" -Left 382 -Width 165
$openVerixetButton.Add_Click({ Open-Url $verixetHandoffUrl })
$form.Controls.Add($openVerixetButton)

$closeButton = New-PanelButton -Text "Close panel" -Left 587 -Width 130
$closeButton.Anchor = "Top,Right"
$closeButton.BackColor = [System.Drawing.Color]::FromArgb(55, 62, 78)
$closeButton.Add_Click({ $form.Close() })
$form.Controls.Add($closeButton)

$timer = [System.Windows.Forms.Timer]::new()
$timer.Interval = 5000
$timer.Add_Tick({
  $xflowOnline = Test-LiveSite $xflowSiteUrl
  $verixetOnline = Test-LiveSite $verixetSiteUrl
  $green = [System.Drawing.Color]::FromArgb(82, 214, 140)
  $amber = [System.Drawing.Color]::FromArgb(255, 204, 102)

  $grid.Rows[0].Cells["status"].Value = if ($xflowOnline) { "Online" } else { "Unavailable" }
  $grid.Rows[1].Cells["status"].Value = if ($verixetOnline) { "Online" } else { "Unavailable" }
  $grid.Rows[2].Cells["status"].Value = if ($xflowOnline -and $verixetOnline) { "Ready" } else { "Waiting..." }
  $grid.Rows[0].Cells["status"].Style.ForeColor = if ($xflowOnline) { $green } else { $amber }
  $grid.Rows[1].Cells["status"].Style.ForeColor = if ($verixetOnline) { $green } else { $amber }
  $grid.Rows[2].Cells["status"].Style.ForeColor = if ($xflowOnline -and $verixetOnline) { $green } else { $amber }

  $ready = $xflowOnline -and $verixetOnline
  $openWalkthroughButton.Enabled = $ready
  if ($ready) {
    $titleLabel.Text = "Live walkthrough ready"
    $nextLabel.Text = "Ready: XFlow sign-in will launch guided walkthrough step 1."
    $nextLabel.ForeColor = $green
    if (-not $script:openedWalkthrough) {
      $script:openedWalkthrough = $true
      Open-Url $walkthroughSignInUrl
    }
  } else {
    $titleLabel.Text = "Waiting for the live sites..."
  }
})

$form.Add_Shown({
  $timer.Start()
  $timer.Tag = "initial"
  $timer.Enabled = $false
  $xflowOnline = Test-LiveSite $xflowSiteUrl
  $verixetOnline = Test-LiveSite $verixetSiteUrl
  $timer.Enabled = $true
  if ($xflowOnline -and $verixetOnline) {
    $grid.Rows[0].Cells["status"].Value = "Online"
    $grid.Rows[1].Cells["status"].Value = "Online"
    $grid.Rows[2].Cells["status"].Value = "Ready"
    $green = [System.Drawing.Color]::FromArgb(82, 214, 140)
    foreach ($row in $grid.Rows) {
      $row.Cells["status"].Style.ForeColor = $green
    }
    $titleLabel.Text = "Live walkthrough ready"
    $nextLabel.Text = "Ready: XFlow sign-in will launch guided walkthrough step 1."
    $nextLabel.ForeColor = $green
    $openWalkthroughButton.Enabled = $true
    $script:openedWalkthrough = $true
    Open-Url $walkthroughSignInUrl
  }
})

$form.Add_FormClosing({ $timer.Stop() })

try {
  [System.Windows.Forms.Application]::Run($form)
} finally {
  $mutex.ReleaseMutex()
  $mutex.Dispose()
}

function cu_UploadFiles() {
    #set site base URL and relative URL
    Get-Content .\config\private\.env | ForEach-Object {
        if ($_ -like 'baseURL*') {
            $siteBaseURL = $_.ToString().Substring($_.ToString().IndexOf('=') + 1)
            Write-Host -ForegroundColor Yellow "Retreived Site Base URL as $siteBaseURL"
        }
        if ($_ -like 'siteURL*') {
            $siteRelativeURL = $_.ToString().Substring($_.ToString().IndexOf('=') + 1)
            Write-Host -ForegroundColor Yellow "Retreived Site Relative URL as $siteRelativeURL"
        }
    }

    $siteFullURL = $siteBaseURL + $siteRelativeURL
    # create ps lists
    $removePNPStrings = New-Object System.Collections.Generic.List[System.Object]
    $AddPNPFileStrings = New-Object System.Collections.Generic.List[System.Object]
    $SetPNPCheckInStrings = New-Object System.Collections.Generic.List[System.Object]

    $siteConfig = Get-Content .\src\1-site\config\siteConfig.json -Raw | ConvertFrom-Json
    #For each custom action in site
    foreach ($el in $siteConfig.customActions) {
        Write-Host -ForegroundColor DarkCyan "Building strings for custom action -" $el.customAction
        Get-ChildItem .\dist -Recurse | ForEach-Object {
            if ($_.GetType() -like 'System.IO.FileInfo' -and $_ -match $el.customAction ) {
                $removePNPStrings.Add((('/' + $el.libraryURL + '/' + $_), $_))
                $AddPNPFileStrings.Add(($el.libraryFolder, $_.FullName, $_))
                $SetPNPCheckInStrings.Add((($siteRelativeURL + '/' + $el.libraryURL + '/' + $_), $_))
            }
        }
    }
    #For each customClass in site
    foreach ($el in $siteConfig.customClass) {
        Write-Host -ForegroundColor DarkCyan "Building strings for custom class -" $el.customClass
        Get-ChildItem .\dist -Recurse | ForEach-Object {
            if ($_.GetType() -like 'System.IO.FileInfo' -and $_ -match $el.customClass ) {
                $removePNPStrings.Add((('/' + $el.libraryURL + '/' + $_), $_))
                $AddPNPFileStrings.Add(($el.libraryFolder, $_.FullName, $_))
                $SetPNPCheckInStrings.Add((($siteRelativeURL + '/' + $el.libraryURL + '/' + $_), $_))
            }
        }
    }
    <#
    #uncomment to validate string building
    Write-Host '*******************************'
    write-host 'strings of resources to remove'
    $removePNPStrings | foreach {
        write-host 'removing:' $_[0]
    }
    Write-Host '*******************************'
    Write-Host '*******************************'
    Write-Host 'strings of resources to add'
    $AddPNPFileStrings | foreach {
        write-host 'adding:' $_[1]
        write-host '       to:' $_[0]
    }
    Write-Host '*******************************'
    Write-Host '*******************************'
    Write-Host 'strings of resources to check in'
    $SetPNPCheckInStrings | foreach {
        write-host 'checking in:' $_[0]
    }
    Write-Host '*******************************'
    #>

    try {
        Connect-PnPOnline -Url $siteFullURL -CurrentCredentials
        Write-Host -ForegroundColor Yellow "Conntected to $siteFullURL"
        $removePNPStrings | ForEach-Object {
            try {
                Remove-PnPFile -SiteRelativeUrl $_[0] -Force
                Write-Host -ForegroundColor Green "Removing" $_[1]
            }
            catch {
                Write-Host -ForegroundColor Red "Something went wrong removing" $_[1]
            }
        }
        $AddPNPFileStrings | ForEach-Object {
            try {
                Write-Host -ForegroundColor Green "Uploading" $_[2] "to" $_[0]
                Add-PnPFile -Folder $_[0] -Path $_[1] > $null
            }
            catch {
                Write-Host -ForegroundColor Red "Something went wrong uploading" $_[2] "to" $_[0]
            }
        }
        $SetPNPCheckInStrings | ForEach-Object {
            try {
                Set-PnPFileCheckedIn -Url $_[0]
                Write-Host -ForegroundColor Green "Checking in" $_[1]
            }
            catch {
                Write-Host -ForegroundColor Red "Something went wrong checking in" $_[1]
            }
        }
        Disconnect-PnPOnline
        Write-Host -ForegroundColor Yellow "Disconnected from $siteFullURL"
        Write-Host '************************************************'
    }
    catch {
        Write-Host -ForegroundColor Red "Something went wrong connecting to $siteFullURL"
    }
    #>
}

cu_UploadFiles
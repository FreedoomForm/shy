!macro customHeader
  !system "echo 'Custom NSIS header loaded'"
!macroend

!macro customInit
  ; Check if previous version is installed and uninstall it silently
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Telegram MCP Manager" "UninstallString"
  ${If} $0 != ""
    ; Uninstall previous version silently
    ExecWait '"$0" /S /quiet /norestart _?=$INSTDIR' $1
    Delete "$0"
    RMDir "$INSTDIR"
  ${EndIf}
  
  ; Also check in HKLM (per-machine install)
  ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Telegram MCP Manager" "UninstallString"
  ${If} $0 != ""
    ExecWait '"$0" /S /quiet /norestart _?=$INSTDIR' $1
    Delete "$0"
    RMDir "$INSTDIR"
  ${EndIf}
!macroend

!macro customInstall
  ; Clean up any leftover files from previous installation
  RMDir /r "$LOCALAPPDATA\Programs\Telegram MCP Manager"
  RMDir /r "$APPDATA\Telegram MCP Manager"
  RMDir /r "$LOCALAPPDATA\Telegram MCP Manager"
  
  ; Copy icon to resources
  SetOutPath "$INSTDIR\resources"
  File "${BUILD_RESOURCES_DIR}\icon.ico"
!macroend

!macro customUnInstall
  ; Clean up all app data on uninstall
  RMDir /r "$LOCALAPPDATA\Programs\Telegram MCP Manager"
  RMDir /r "$APPDATA\Telegram MCP Manager"
  RMDir /r "$LOCALAPPDATA\Telegram MCP Manager"
  RMDir /r "$INSTDIR"
!macroend

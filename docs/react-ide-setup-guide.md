# VS Code Setup Guide: React IDE Configuration

## Table of Contents
1. [Option 2: VS Code with Profiles (Most Efficient)](#option-2-vs-code-with-profiles)
2. [Option 3: STS4 + VS Code React-Optimized (Balanced)](#option-3-sts4--vs-code-react-optimized)
3. [Verification & Testing](#verification--testing)
4. [Troubleshooting](#troubleshooting)
5. [Daily Workflow Tips](#daily-workflow-tips)

---

# Option 2: VS Code with Profiles (Most Efficient)

**RAM Usage:** ~500-800MB (only one profile active at a time)  
**Best for:** Maximum efficiency, single-IDE workflow, RAM optimization

## Step 1: Prepare VS Code

### 1.1 Update VS Code to Latest Version
```
1. Open VS Code
2. Help → Check for Updates
3. Install any available updates
4. Restart VS Code
```

### 1.2 Clean Existing Extensions (Optional)
If you have many extensions already:
```
1. Ctrl+Shift+X (Extensions panel)
2. Review installed extensions
3. Disable/uninstall unused extensions
4. This ensures clean profile creation
```

---

## Step 2: Create Java Backend Profile

### 2.1 Create Profile
```
1. Click gear icon (bottom-left) → Profiles → Create Profile
   OR: Ctrl+Shift+P → "Profiles: Create Profile"

2. Configuration:
   - Name: "Java Backend"
   - Icon: Choose coffee cup or gear icon
   - Based on: "None (Empty Profile)" (cleanest start)
   - Click "Create"
```

### 2.2 Install Backend Extensions
With "Java Backend" profile active, install these extensions:

**Core Java Extensions:**
```
1. Extension Pack for Java
   Publisher: Microsoft
   ID: vscjava.vscode-java-pack
   
   This installs:
   - Language Support for Java (Red Hat)
   - Debugger for Java
   - Test Runner for Java
   - Maven for Java
   - Project Manager for Java
   - IntelliCode
```

**Spring Boot Extensions:**
```
2. Spring Boot Extension Pack
   Publisher: VMware
   ID: vmware.vscode-boot-dev-pack
   
   This installs:
   - Spring Boot Tools
   - Spring Initializr Java Support
   - Spring Boot Dashboard

3. Spring Boot Snippets
   Publisher: Eduardo Rodrigues
   ID: editorconfig.editorconfig
```

**Database Tools:**
```
4. PostgreSQL (Optional but helpful)
   Publisher: Chris Kolkman
   ID: ckolkman.vscode-postgres
```

**Additional Helpful Extensions:**
```
5. XML (for pom.xml editing)
   Publisher: Red Hat
   ID: redhat.vscode-xml

6. YAML (for application.yml if you use it)
   Publisher: Red Hat
   ID: redhat.vscode-yaml
```

### 2.3 Configure Java Backend Settings

**Open Settings (Ctrl+,) and add to User Settings:**

```json
{
  // Java Configuration
  "java.configuration.updateBuildConfiguration": "automatic",
  "java.compile.nullAnalysis.mode": "automatic",
  "java.debug.settings.onBuildFailureProceed": true,
  
  // Maven
  "maven.executable.path": "auto",
  "maven.terminal.useJavaHome": true,
  
  // Editor
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.tabSize": 4,
  "editor.insertSpaces": true,
  
  // Files
  "files.exclude": {
    "**/.classpath": true,
    "**/.project": true,
    "**/.settings": true,
    "**/.factorypath": true
  },
  
  // Terminal
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  
  // Bracket pairs
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": true
}
```

### 2.4 Configure Spring Boot Dashboard

```
1. After installing Spring Boot extensions, you'll see "Spring Boot Dashboard" in left sidebar
2. This shows all Spring Boot applications in your workspace
3. Click the play button to run your app
4. Click square to stop
```

---

## Step 3: Create React Frontend Profile

### 3.1 Switch and Create New Profile
```
1. Click gear icon (bottom-left) → Profiles → Create Profile
2. Configuration:
   - Name: "React Frontend"
   - Icon: Choose atom or lightning icon
   - Based on: "None (Empty Profile)"
   - Click "Create"
```

### 3.2 Install Frontend Extensions

**Essential React Extensions:**
```
1. ES7+ React/Redux/React-Native snippets
   Publisher: dsznajder
   ID: dsznajder.es7-react-js-snippets
   ⭐ MOST IMPORTANT - React shortcuts

2. Prettier - Code formatter
   Publisher: Prettier
   ID: esbenp.prettier-vscode
   ⭐ Auto-format code

3. ESLint
   Publisher: Microsoft
   ID: dbaeumer.vscode-eslint
   ⭐ Catch JavaScript errors
```

**Highly Recommended:**
```
4. Auto Rename Tag
   Publisher: Jun Han
   ID: formulahendry.auto-rename-tag
   
5. Auto Close Tag
   Publisher: Jun Han
   ID: formulahendry.auto-close-tag

6. Path Intellisense
   Publisher: Christian Kohler
   ID: christian-kohler.path-intellisense

7. JavaScript (ES6) code snippets
   Publisher: charalampos karypidis
   ID: xabikos.javascriptsnippets

8. npm Intellisense
   Publisher: Christian Kohler
   ID: christian-kohler.npm-intellisense
```

**Optional But Useful:**
```
9. Thunder Client (API testing without Postman)
   Publisher: Ranga Vadhineni
   ID: rangav.vscode-thunder-client

10. Color Highlight
    Publisher: Sergii N
    ID: naumovs.color-highlight

11. CSS Peek
    Publisher: Pranay Prakash
    ID: pranaygp.vscode-css-peek

12. Import Cost
    Publisher: Wix
    ID: wix.vscode-import-cost
    (Shows package size when importing)
```

### 3.3 Configure React Frontend Settings

**Open Settings (Ctrl+,) in React profile:**

```json
{
  // Formatting
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnPaste": true,
  
  // React/JSX specific
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "emmet.triggerExpansionOnTab": true,
  
  // Prettier configuration
  "prettier.semi": true,
  "prettier.singleQuote": true,
  "prettier.tabWidth": 2,
  "prettier.trailingComma": "es5",
  "prettier.printWidth": 80,
  "prettier.arrowParens": "avoid",
  
  // JavaScript/TypeScript
  "javascript.updateImportsOnFileMove.enabled": "always",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "javascript.suggest.autoImports": true,
  "typescript.suggest.autoImports": true,
  
  // Editor
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.wordWrap": "on",
  
  // File nesting (clean sidebar)
  "explorer.fileNesting.enabled": true,
  "explorer.fileNesting.patterns": {
    "*.js": "${capture}.test.js, ${capture}.spec.js",
    "*.jsx": "${capture}.test.jsx, ${capture}.spec.jsx, ${capture}.module.css",
    "*.tsx": "${capture}.test.tsx, ${capture}.spec.tsx, ${capture}.module.css",
    "package.json": "package-lock.json, yarn.lock, pnpm-lock.yaml"
  },
  
  // Terminal
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  
  // Bracket pairs
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": true,
  
  // Auto save
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000
}
```

### 3.4 Create React Snippets Cheatsheet

Create a file `react-snippets.md` in your workspace for quick reference:

```markdown
# React Snippets Cheatsheet (ES7+ extension)

## Components
- `rafce` → Arrow function component with export
- `rfc` → Regular function component
- `rfce` → Function component with export
- `rcc` → Class component
- `rccp` → Class component with PropTypes

## Hooks
- `useState` → useState hook
- `useEffect` → useEffect hook
- `useContext` → useContext hook
- `useReducer` → useReducer hook
- `useCallback` → useCallback hook
- `useMemo` → useMemo hook
- `useRef` → useRef hook

## Imports
- `imr` → import React from 'react'
- `imrs` → import React, { useState } from 'react'
- `imrc` → import React, { Component } from 'react'

## PropTypes
- `pta` → PropTypes.array
- `ptar` → PropTypes.array.isRequired
- `ptb` → PropTypes.bool
- `ptf` → PropTypes.func
- `pto` → PropTypes.object
- `pts` → PropTypes.string

## Console
- `clg` → console.log()
- `clo` → console.log('object', object)
```

---

## Step 4: Profile Switching Workflow

### 4.1 How to Switch Profiles

**Method 1: Click Icon**
```
1. Click gear icon (bottom-left)
2. Click "Profiles"
3. Select desired profile
4. VS Code reloads instantly
```

**Method 2: Command Palette (Faster)**
```
1. Ctrl+Shift+P
2. Type "Profiles: Switch"
3. Select profile
```

**Method 3: Keyboard Shortcut (Create Custom)**
```
1. File → Preferences → Keyboard Shortcuts
2. Search "switch profile"
3. Add keybinding (e.g., Ctrl+Alt+J for Java, Ctrl+Alt+R for React)
```

### 4.2 Workflow Strategy

**Typical Development Day:**

**Morning (Backend work):**
```
1. Open VS Code
2. Switch to "Java Backend" profile
3. Open dental-clinic-backend folder
4. Work on Spring Boot code
5. Run via Spring Boot Dashboard
```

**Afternoon (Frontend work):**
```
1. Ctrl+Shift+P → Switch to "React Frontend" profile
2. Open dental-clinic-frontend folder
3. Terminal: npm run dev
4. Work on React components
```

**Profile switch takes ~2-3 seconds** (just reloads extensions)

---

# Option 3: STS4 + VS Code React-Optimized (Balanced)

**RAM Usage:** ~2GB total (STS4: 1.5GB + VS Code: 500MB)  
**Best for:** Dedicated specialized IDEs, no profile switching, premium Java experience

## Step 1: Verify STS4 Installation

### 1.1 Launch STS4
```
1. Navigate to STS4 installation folder
2. Run SpringToolSuite4.exe
3. Choose workspace (e.g., C:\Dev\workspace)
4. Wait for initialization (~30 seconds first time)
```

### 1.2 Optimize STS4 Memory (Optional)

**Edit SpringToolSuite4.ini:**
```ini
-Xms512m        # Minimum heap
-Xmx1536m       # Maximum heap (1.5GB)
-XX:+UseG1GC    # Better garbage collection
```

### 1.3 Install Useful STS4 Plugins (Optional)

**Help → Eclipse Marketplace:**
```
1. Darkest Dark Theme (if you prefer dark mode)
2. AnyEdit Tools (better find/replace)
3. ResourceBundle Editor (for properties files)
```

### 1.4 Configure STS4 for Better Performance

**Window → Preferences:**

```
General → Startup and Shutdown:
☐ Refresh workspace on startup (uncheck for faster startup)

General → Editors → Text Editors:
☑ Show line numbers
☑ Show print margin (column: 120)

Java → Editor → Save Actions:
☑ Perform the selected actions on save
☑ Format source code
☑ Organize imports

Maven:
☑ Do not automatically update dependencies from remote repositories
☑ Download repository index updates on startup (for first time only)
```

---

## Step 2: Configure VS Code for React

### 2.1 Install React Extensions

**Open VS Code and install these extensions:**

**Essential (Install First):**
```
1. ES7+ React/Redux/React-Native snippets
   Publisher: dsznajder
   
2. Prettier - Code formatter
   Publisher: esbenp.prettier-vscode
   
3. ESLint
   Publisher: dbaeumer.vscode-eslint
```

**Highly Recommended:**
```
4. Auto Rename Tag (formulahendry.auto-rename-tag)
5. Auto Close Tag (formulahendry.auto-close-tag)
6. Path Intellisense (christian-kohler.path-intellisense)
7. JavaScript (ES6) code snippets (xabikos.javascriptsnippets)
8. npm Intellisense (christian-kohler.npm-intellisense)
```

**Optional:**
```
9. Thunder Client (rangav.vscode-thunder-client)
10. Color Highlight (naumovs.color-highlight)
11. CSS Peek (pranaygp.vscode-css-peek)
12. Import Cost (wix.vscode-import-cost)
13. GitLens (eamodio.gitlens) - if using Git
```

### 2.2 Configure VS Code Settings

**File → Preferences → Settings (or Ctrl+,)**

Click "Open Settings (JSON)" button in top-right:

```json
{
  // Formatting
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnPaste": true,
  
  // React/JSX
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "emmet.triggerExpansionOnTab": true,
  
  // Prettier
  "prettier.semi": true,
  "prettier.singleQuote": true,
  "prettier.tabWidth": 2,
  "prettier.trailingComma": "es5",
  "prettier.printWidth": 80,
  "prettier.arrowParens": "avoid",
  
  // JavaScript
  "javascript.updateImportsOnFileMove.enabled": "always",
  "javascript.suggest.autoImports": true,
  
  // Editor
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.wordWrap": "on",
  "editor.suggestSelection": "first",
  "editor.quickSuggestions": {
    "strings": true
  },
  
  // File nesting
  "explorer.fileNesting.enabled": true,
  "explorer.fileNesting.patterns": {
    "*.js": "${capture}.test.js, ${capture}.spec.js",
    "*.jsx": "${capture}.test.jsx, ${capture}.spec.jsx, ${capture}.module.css",
    "package.json": "package-lock.json, yarn.lock"
  },
  
  // Terminal
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "terminal.integrated.fontSize": 14,
  
  // Bracket pairs
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": true,
  
  // Auto save
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  
  // Exclude from explorer
  "files.exclude": {
    "**/node_modules": true,
    "**/.git": true
  }
}
```

### 2.3 Create Prettier Configuration

**In your frontend project root, create `.prettierrc`:**

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "avoid",
  "endOfLine": "auto"
}
```

### 2.4 Create ESLint Configuration

**In your frontend project root, create `.eslintrc.json`:**

```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "plugins": ["react"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "warn"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

### 2.5 Install Recommended Theme (Optional)

Popular themes for React development:

**File → Preferences → Color Theme (Ctrl+K Ctrl+T):**

```
Install from Extensions:
- One Dark Pro (binaryify.onedark-pro)
- Material Theme (equinusocio.vsc-material-theme)
- Night Owl (sdras.night-owl)
- Dracula Official (dracula-theme.theme-dracula)
- GitHub Theme (github.github-vscode-theme)
```

---

## Step 3: Workflow Configuration

### 3.1 Desktop Organization

**Create shortcuts for quick launch:**

**Windows Desktop:**
```
1. Create shortcut to SpringToolSuite4.exe
   - Right-click → Send to → Desktop
   - Rename: "Backend - Spring Tools"

2. Create shortcut to VS Code
   - Right-click Code.exe → Send to → Desktop
   - Rename: "Frontend - VS Code"
```

**Windows Taskbar:**
```
1. Pin both applications to taskbar
2. STS4 on left, VS Code on right
3. Use Win+1, Win+2 to switch quickly
```

### 3.2 Window Arrangement

**For Single Monitor:**

**Option A: Side-by-side (requires 1920x1080 or higher):**
```
1. Win + Left Arrow → STS4 (left half)
2. Win + Right Arrow → VS Code (right half)
3. Alt+Tab to switch focus
```

**Option B: Full screen with Alt+Tab:**
```
1. STS4 maximized (Win+1 to focus)
2. VS Code maximized (Win+2 to focus)
3. Alt+Tab to switch
```

**For Dual Monitor:**
```
Monitor 1: STS4 (Java backend)
Monitor 2: VS Code (React frontend) + Browser
```

### 3.3 Typical Workflow

**Backend Development (STS4):**
```
1. Open STS4
2. Import/Open dental-clinic-backend project
3. Make changes to Java/Spring code
4. Run via Boot Dashboard (right-click project → Run As → Spring Boot App)
5. View console output in STS4
6. Test endpoints: http://localhost:8080/api/...
```

**Frontend Development (VS Code):**
```
1. Open VS Code
2. File → Open Folder → dental-clinic-frontend
3. Terminal: npm run dev
4. Edit React components
5. Browser auto-refreshes on save
6. Test UI: http://localhost:5173
```

---

# Verification & Testing

## Test Java Backend Profile/STS4

### Create Test Spring Boot Project

**Using STS4:**
```
1. File → New → Spring Starter Project
2. Name: test-backend
3. Type: Maven
4. Java Version: 17
5. Dependencies: Spring Web
6. Finish
```

**Using VS Code Java Profile (Option 2):**
```
1. Ctrl+Shift+P → "Spring Initializr: Create a Maven Project"
2. Spring Boot version: 3.2.x
3. Language: Java
4. Group: com.test
5. Artifact: test-backend
6. Dependencies: Spring Web
7. Generate and open
```

### Verify Java Setup

**Create simple REST controller:**

`src/main/java/com/test/testbackend/TestController.java`:
```java
package com.test.testbackend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    
    @GetMapping("/test")
    public String test() {
        return "Java Backend is working!";
    }
}
```

**Run and test:**
```
1. Right-click project → Run As → Spring Boot App (STS4)
   OR: Click play button in Spring Boot Dashboard (VS Code)
2. Wait for "Started TestBackendApplication"
3. Open browser: http://localhost:8080/test
4. Should see: "Java Backend is working!"
```

✅ **If you see the message, Java backend setup is verified!**

---

## Test React Frontend Profile/VS Code

### Create Test React Project

**Open terminal (in VS Code or PowerShell):**
```bash
npm create vite@latest test-frontend -- --template react
cd test-frontend
npm install
npm run dev
```

### Verify React Setup

**Test snippets in VS Code:**

1. Open `src/App.jsx`
2. Delete all content
3. Type: `rafce` and press Tab
4. Should auto-generate:
```javascript
import React from 'react'

const App = () => {
  return (
    <div>App</div>
  )
}

export default App
```

5. Modify to:
```javascript
import React from 'react'

const App = () => {
  return (
    <div>
      <h1>React Frontend is working!</h1>
      <p>VS Code React setup verified ✓</p>
    </div>
  )
}

export default App
```

6. Save (Ctrl+S) - should auto-format with Prettier
7. Browser should auto-refresh and show message

✅ **If browser shows the message and code auto-formatted, React setup is verified!**

---

## Test Profile Switching (Option 2 Only)

```
1. With React profile active, try typing `rafce`
   ✅ Should work - snippet recognized

2. Switch to Java Backend profile:
   - Gear icon → Profiles → Java Backend

3. Try typing `rafce`
   ❌ Should not work - snippet not in Java profile

4. Create Java class, type `sysout` and Tab
   ✅ Should create System.out.println() - Java snippet works

5. Switch back to React Frontend profile
```

✅ **If snippets work only in appropriate profiles, profile isolation is verified!**

---

# Troubleshooting

## Common Issues

### VS Code Extensions Not Working

**Problem:** Extensions installed but not working

**Solution:**
```
1. Ctrl+Shift+P → "Developer: Reload Window"
2. Or restart VS Code completely
3. Check extension is enabled (Extensions panel)
4. Verify correct profile is active (bottom-left shows profile name)
```

### Prettier Not Formatting

**Problem:** Code not formatting on save

**Solution:**
```
1. Verify Prettier is installed and enabled
2. Check settings:
   - "editor.formatOnSave": true
   - "editor.defaultFormatter": "esbenp.prettier-vscode"
3. Right-click in code → Format Document With... → Prettier
4. Check .prettierrc exists in project root
```

### ESLint Errors Not Showing

**Problem:** ESLint warnings not appearing

**Solution:**
```
1. Verify ESLint extension installed
2. In frontend project: npm install eslint --save-dev
3. Create .eslintrc.json (see configuration above)
4. Reload VS Code
5. Open Output panel → Select "ESLint" - check for errors
```

### Java Extensions Not Loading (VS Code Java Profile)

**Problem:** Java code not recognized

**Solution:**
```
1. Verify Java JDK installed: java -version
2. Ctrl+Shift+P → "Java: Configure Java Runtime"
3. Verify JDK path is correct
4. Delete .vscode folder in project (if exists)
5. Reload window
6. Wait 2-3 minutes for initial project indexing
```

### Spring Boot Dashboard Not Showing Apps (VS Code)

**Problem:** Spring Boot Dashboard empty

**Solution:**
```
1. Verify project has pom.xml with spring-boot-starter-parent
2. Click refresh button in Spring Boot Dashboard
3. Right-click project in Explorer → "Add to Spring Boot Dashboard"
4. Restart VS Code
```

### STS4 Slow Startup

**Problem:** STS4 takes too long to start

**Solution:**
```
1. Edit SpringToolSuite4.ini:
   -Xms512m
   -Xmx1536m
   -XX:+UseG1GC

2. Preferences → General → Startup and Shutdown
   - Uncheck unnecessary startup plugins

3. Close unnecessary Eclipse views (Window → Show View)
   - Keep: Package Explorer, Problems, Console, Boot Dashboard

4. Clean workspace: Project → Clean
```

### Profile Switch Not Working (Option 2)

**Problem:** Profile doesn't seem to change

**Solution:**
```
1. Look at bottom-left - profile name should change
2. Extensions panel should show different extensions enabled
3. If confused, create new profile from scratch
4. Profiles are stored in: %APPDATA%\Code\User\profiles\
```

---

# Daily Workflow Tips

## For Option 2 (Profiles)

### Morning Startup
```
1. Open VS Code
2. Recent Projects dropdown appears
3. Select backend project → Auto-switches to Java profile
4. Or manually switch: Ctrl+Shift+P → "Java Backend"
```

### Switching During Day
```
Backend work:
- Open backend folder
- Profile: Java Backend
- Run Spring Boot app via dashboard

Frontend work:
- File → Open Folder → frontend
- Switch profile: "React Frontend"
- Terminal: npm run dev
```

### Memory Management
```
- Only one profile loads extensions at a time
- Switching profiles unloads previous extensions
- Result: ~500-800MB RAM regardless of which profile
```

---

## For Option 3 (STS4 + VS Code)

### Morning Startup
```
1. Launch STS4 first (heavier startup)
2. While STS4 loads, launch VS Code
3. STS4: Open backend project
4. VS Code: Open frontend folder
5. Both running simultaneously
```

### Daily Workflow
```
Backend changes:
- Focus STS4 (Win+1 or Alt+Tab)
- Edit Java code
- Run via Boot Dashboard
- Check console for logs

Frontend changes:
- Focus VS Code (Win+2 or Alt+Tab)
- Edit React components
- Auto-refresh in browser
- Check terminal for build output

Testing integration:
- Backend running in STS4 (port 8080)
- Frontend running in VS Code terminal (port 5173)
- Browser: localhost:5173 calls localhost:8080/api
```

### Memory Management
```
- STS4 uses ~1.5GB consistently
- VS Code uses ~500MB consistently
- Total: ~2GB
- With browser + PostgreSQL: ~5-6GB total
- Your 16GB RAM: Plenty of headroom!
```

---

## Keyboard Shortcuts Cheatsheet

### VS Code Universal Shortcuts
```
Ctrl+P          → Quick file open
Ctrl+Shift+P    → Command palette
Ctrl+`          → Toggle terminal
Ctrl+B          → Toggle sidebar
Ctrl+,          → Settings
Ctrl+K Ctrl+T   → Change theme
Ctrl+Shift+F    → Search in all files
Ctrl+Shift+H    → Replace in all files
Alt+Up/Down     → Move line up/down
Ctrl+/          → Toggle comment
Ctrl+Space      → Trigger suggestions
F12             → Go to definition
Alt+F12         → Peek definition
```

### React-Specific (with ES7 extension)
```
rafce + Tab     → Arrow function component
imrs + Tab      → Import React with useState
clg + Tab       → console.log()
```

### STS4/Eclipse Shortcuts
```
Ctrl+Shift+R    → Open resource (file)
Ctrl+Shift+T    → Open type (class)
Ctrl+Space      → Auto-complete
Ctrl+1          → Quick fix
Ctrl+Shift+O    → Organize imports
Ctrl+Shift+F    → Format code
F3              → Go to definition
Ctrl+/          → Toggle comment
Ctrl+D          → Delete line
Alt+Shift+R     → Rename (refactor)
Ctrl+Shift+L    → Show all shortcuts
```

---

## Performance Monitoring

### Check RAM Usage (Windows)

**Task Manager (Ctrl+Shift+Esc):**
```
Processes tab → Sort by Memory

Look for:
- SpringToolSuite4.exe (STS4): ~1.5GB
- Code.exe (VS Code): ~500MB (main process)
- postgres.exe: ~200-400MB
- java.exe (Spring Boot app): ~500MB-1GB
- chrome.exe / msedge.exe: ~2-3GB

Total development environment: ~5-7GB
Remaining: 9-11GB for OS and other apps
```

### Optimization Tips

**If running low on RAM:**

1. **Close unused browser tabs** (biggest RAM consumer)
2. **Disable VS Code extensions you don't use**
   - Extensions → Disable (keeps them for later)
3. **Close STS4 views you don't need**
   - Window → Show View → Close unused views
4. **Stop Spring Boot app when not testing**
   - Red square button in console
5. **Use Edge instead of Chrome**
   - Better RAM management on Windows 11

---

## Backup Your Configurations

### Export VS Code Settings

**For Option 2 (Profiles):**
```
Settings Sync is automatic if signed in with GitHub/Microsoft

Manual backup:
1. Gear icon → Profiles → Export Profile
2. Select profile to export
3. Save to USB drive or cloud storage
```

**For Option 3:**
```
Your settings are in:
%APPDATA%\Code\User\settings.json

Copy this file to backup location
```

### Export STS4 Settings

```
File → Export → General → Preferences
Select preferences to export
Save to backup location
```

---

## Next Steps

After completing setup:

### For Option 2:
1. ✅ Test both profiles with sample projects
2. ✅ Verify profile switching works smoothly
3. ✅ Get comfortable with workflow
4. ✅ Proceed to Session 1 of dental clinic project

### For Option 3:
1. ✅ Verify STS4 runs Spring Boot projects
2. ✅ Verify VS Code handles React with snippets
3. ✅ Test running both simultaneously
4. ✅ Proceed to Session 1 of dental clinic project

---

## Support & Resources

### VS Code Documentation
- Official Docs: https://code.visualstudio.com/docs
- React in VS Code: https://code.visualstudio.com/docs/nodejs/reactjs-tutorial
- Java in VS Code: https://code.visualstudio.com/docs/java/java-tutorial
- Keyboard Shortcuts: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf

### STS4/Spring Boot Documentation
- Spring Tools: https://spring.io/tools
- Spring Boot Guides: https://spring.io/guides
- Spring Boot Reference: https://docs.spring.io/spring-boot/docs/current/reference/html/

### Extension Documentation
- ES7 React Snippets: https://github.com/dsznajder/vscode-react-javascript-snippets
- Prettier: https://prettier.io/docs/en/
- ESLint: https://eslint.org/docs/latest/

### Community Support
- VS Code Discord: https://discord.com/invite/vscode
- Stack Overflow: Tag with [visual-studio-code], [spring-boot], [reactjs]
- Reddit: r/vscode, r/reactjs, r/SpringBoot

---

# Advanced Tips & Tricks

## VS Code Power User Tips

### Multi-Cursor Editing
```
Ctrl+Alt+Up/Down    → Add cursor above/below
Ctrl+D              → Select next occurrence
Ctrl+Shift+L        → Select all occurrences
Alt+Click           → Add cursor at click position
```

**Use case:** Rename variables across multiple lines simultaneously

### Advanced Search & Replace
```
Ctrl+F              → Find in current file
Ctrl+H              → Replace in current file
Ctrl+Shift+F        → Find in all files
Ctrl+Shift+H        → Replace in all files

Regex mode:         → Click .* button or Alt+R
Case sensitive:     → Alt+C
Whole word:         → Alt+W
```

### Zen Mode (Distraction-Free)
```
Ctrl+K Z            → Enter Zen Mode
Esc Esc             → Exit Zen Mode
```

**Removes all UI elements for focused coding**

### Code Folding
```
Ctrl+Shift+[        → Fold region
Ctrl+Shift+]        → Unfold region
Ctrl+K Ctrl+0       → Fold all
Ctrl+K Ctrl+J       → Unfold all
```

---

## STS4 Power User Tips

### Quick Navigation
```
Ctrl+Shift+T        → Open type (fastest way to find classes)
Ctrl+Shift+R        → Open resource (files)
Ctrl+O              → Quick outline (methods in current class)
Ctrl+E              → Quick switch editor
Ctrl+F6             → Switch between open editors
```

### Code Generation
```
Alt+Shift+S         → Source menu
  → Generate Getters/Setters
  → Generate Constructor
  → Generate toString()
  → Generate equals() and hashCode()

Ctrl+Space          → Content assist (auto-complete)
Ctrl+1              → Quick fix suggestions
```

### Refactoring
```
Alt+Shift+R         → Rename (renames everywhere)
Alt+Shift+M         → Extract method
Alt+Shift+L         → Extract local variable
Alt+Shift+C         → Change method signature
```

### Debugging
```
Ctrl+Shift+B        → Toggle breakpoint
F11                 → Debug
F5                  → Step into
F6                  → Step over
F7                  → Step return
F8                  → Resume
Ctrl+Shift+I        → Inspect variable
```

---

## React Development Best Practices

### Project Structure Organization
```
src/
├── components/
│   ├── common/          → Reusable components
│   ├── layout/          → Layout components
│   └── features/        → Feature-specific components
├── services/
│   └── api.js           → API calls
├── hooks/               → Custom hooks
├── utils/               → Helper functions
├── styles/              → Global styles
├── assets/              → Images, fonts
├── App.jsx
└── main.jsx
```

### Component File Naming
```
PascalCase for components:  AppointmentTable.jsx
camelCase for utilities:    api.js, helpers.js
kebab-case for styles:      appointment-table.css
```

### Import Order Convention
```javascript
// 1. External libraries
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 2. Internal components
import AppointmentTable from './components/AppointmentTable';
import SearchBar from './components/SearchBar';

// 3. Services/Utils
import { appointmentAPI } from './services/api';

// 4. Styles
import './App.css';
```

### React Snippets Quick Reference

**Most Useful Snippets (ES7 Extension):**

```
Component Creation:
rafce    → Arrow function component with export (MOST USED)
rfc      → Function component
rfce     → Function component with export
rcc      → Class component

Hooks:
useState → const [state, setState] = useState(initialState)
useEffect → useEffect(() => { }, [])
useContext → const context = useContext(contextName)

Common Patterns:
clg      → console.log()
clo      → console.log('object', object)
nfn      → const functionName = () => { }
dob      → const { } = objectName
dar      → const [ ] = arrayName
```

### VS Code React Workflow Tips

**Live Server for Quick Testing:**
```
1. Install "Live Server" extension
2. Right-click index.html → Open with Live Server
3. Auto-refreshes on save
```

**Snippet Customization:**
```
File → Preferences → User Snippets → javascriptreact.json

Add custom snippets:
{
  "Custom Component": {
    "prefix": "mycomp",
    "body": [
      "import React from 'react';",
      "",
      "const ${1:ComponentName} = () => {",
      "  return (",
      "    <div className=\"${2:container}\">",
      "      $0",
      "    </div>",
      "  );",
      "};",
      "",
      "export default ${1:ComponentName};"
    ],
    "description": "My custom React component"
  }
}
```

---

## Spring Boot Development Best Practices

### Project Structure (Maven)
```
src/
├── main/
│   ├── java/
│   │   └── com/dentalclinic/
│   │       ├── DentalClinicApplication.java
│   │       ├── config/
│   │       ├── controller/
│   │       ├── dto/
│   │       ├── model/
│   │       ├── repository/
│   │       └── service/
│   └── resources/
│       ├── application.properties
│       ├── application-dev.properties
│       ├── application-prod.properties
│       └── static/
└── test/
    └── java/
```

### STS4 Spring Boot Dashboard

**Running Multiple Apps:**
```
1. Boot Dashboard shows all Spring Boot projects
2. Right-click project → (Re)start
3. Running apps show green play icon
4. Click stop button to terminate
5. Console switches automatically to active app
```

**Useful Features:**
```
- Live Beans: See all Spring beans in running app
- Request Mappings: View all REST endpoints
- Properties: See all application properties
- Actuator: Access Spring Boot Actuator endpoints
```

### Hot Reload Configuration

**Add Spring Boot DevTools to pom.xml:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>
```

**Benefits:**
- Auto-restart on code changes
- LiveReload support for frontend
- Faster development cycle

---

## Integration Testing Workflow

### Testing Backend APIs

**Using Thunder Client (VS Code):**
```
1. Install Thunder Client extension (React profile)
2. Click lightning icon in sidebar
3. New Request
4. Method: GET, URL: http://localhost:8080/api/patients
5. Send
6. Save to Collection: "Dental Clinic API"
7. Create requests for all endpoints
```

**Using Postman:**
```
1. Install Postman desktop app
2. Create new Collection: "Dental Clinic"
3. Add requests for all endpoints:
   - GET /api/patients
   - POST /api/patients
   - GET /api/appointments/with-patients
   - etc.
4. Save and share collection
```

**Sample Request Bodies:**

**POST /api/patients:**
```json
{
  "name": "John Doe",
  "birthYear": 1985,
  "gender": "Male",
  "phone": "555-0123",
  "address": "123 Main St"
}
```

**POST /api/appointments:**
```json
{
  "date": "2024-03-20",
  "diagnosis": "Cavity",
  "treatment": "Filling",
  "needsImplant": false,
  "needsDenture": false,
  "needsOrthodontics": false,
  "fee": 150.00,
  "note": "Follow-up in 6 months",
  "patient": {
    "id": 1
  }
}
```

---

## Git Integration

### Initialize Git Repository

**Backend (in STS4 or terminal):**
```bash
cd dental-clinic-backend
git init
git add .
git commit -m "Initial commit: Spring Boot backend setup"
```

**Frontend (in VS Code terminal):**
```bash
cd dental-clinic-frontend
git init
git add .
git commit -m "Initial commit: React frontend setup"
```

### .gitignore Files

**Backend (.gitignore):**
```
HELP.md
target/
!.mvn/wrapper/maven-wrapper.jar
!**/src/main/**/target/
!**/src/test/**/target/

### STS ###
.apt_generated
.classpath
.factorypath
.project
.settings
.springBeans
.sts4-cache

### IntelliJ IDEA ###
.idea
*.iws
*.iml
*.ipr

### NetBeans ###
/nbproject/private/
/nbbuild/
/dist/
/nbdist/
/.nb-gradle/
build/
!**/src/main/**/build/
!**/src/test/**/build/

### VS Code ###
.vscode/

### Application ###
application-local.properties
```

**Frontend (.gitignore):**
```
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.vscode/
.idea/
```

### Git Workflow

**Daily commit workflow:**
```bash
# Check status
git status

# Stage changes
git add .
# Or selectively: git add src/components/AppointmentTable.jsx

# Commit with meaningful message
git commit -m "feat: Add search functionality to appointments"

# Push to remote (if using GitHub/GitLab)
git push origin main
```

**Commit Message Conventions:**
```
feat: New feature
fix: Bug fix
docs: Documentation changes
style: Code style changes (formatting)
refactor: Code refactoring
test: Adding tests
chore: Maintenance tasks
```

---

## Database Management

### Using pgAdmin 4

**Connect to Database:**
```
1. Open pgAdmin 4
2. Servers → PostgreSQL → dental_clinic
3. Right-click → Query Tool
4. Run SQL queries directly
```

**View Tables:**
```
1. Expand dental_clinic → Schemas → public → Tables
2. Right-click table → View/Edit Data → All Rows
3. See all records in graphical interface
```

**Backup Database:**
```
1. Right-click dental_clinic → Backup
2. Format: Custom (compressed)
3. Filename: dental_clinic_backup_2024-01-26.backup
4. Click Backup
```

**Restore Database:**
```
1. Create new database or use existing
2. Right-click database → Restore
3. Select backup file
4. Click Restore
```

### Using VS Code PostgreSQL Extension (Optional)

**Install extension:**
```
Name: PostgreSQL
Publisher: Chris Kolkman
```

**Connect to database:**
```
1. Click PostgreSQL icon in sidebar
2. Add Connection
3. Host: localhost
4. Port: 5432
5. Username: postgres
6. Password: [your password]
7. Database: dental_clinic
```

**Run queries:**
```
1. Right-click connection → New Query
2. Write SQL
3. Ctrl+Enter to execute
4. Results show in output panel
```

---

## Performance Optimization

### VS Code Performance Tuning

**If VS Code feels slow:**

**settings.json additions:**
```json
{
  // Disable features you don't need
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/build/**": true
  },
  
  // Reduce file monitoring
  "files.maxMemoryForLargeFilesMB": 4096,
  
  // Disable telemetry
  "telemetry.telemetryLevel": "off",
  
  // Reduce animations
  "workbench.reduceMotion": "on"
}
```

**Extension Management:**
```
1. Review installed extensions
2. Disable unused extensions (don't uninstall)
3. Only enable when needed
4. Check extension update settings
```

### STS4 Performance Tuning

**SpringToolSuite4.ini optimization:**
```ini
-startup
plugins/org.eclipse.equinox.launcher_1.6.400.v20210924-0641.jar
--launcher.library
plugins/org.eclipse.equinox.launcher.win32.win32.x86_64_1.2.400.v20211117-0650
-product
org.springframework.boot.ide.branding.sts4
--launcher.defaultAction
openFile
-vmargs
-Dosgi.requiredJavaVersion=17
-Xms512m
-Xmx1536m
-XX:+UseG1GC
-XX:+UseStringDeduplication
--add-modules=ALL-SYSTEM
```

**Key optimizations:**
- `-Xms512m` - Start with 512MB
- `-Xmx1536m` - Max 1.5GB
- `-XX:+UseG1GC` - Better garbage collection
- `-XX:+UseStringDeduplication` - Reduce string memory

**Workspace Settings:**
```
Window → Preferences → General → Workspace:
☐ Refresh using native hooks or polling (disable for SSD)
☐ Build automatically (disable if causing issues)

Window → Preferences → Maven:
☐ Download repository index updates on startup (disable after first time)
```

---

## Environment-Specific Configurations

### Spring Boot Profiles

**Create profile-specific properties:**

**application-dev.properties:**
```properties
# Development environment
spring.datasource.url=jdbc:postgresql://localhost:5432/dental_clinic
spring.datasource.username=postgres
spring.datasource.password=devpassword

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Enable debug logging
logging.level.com.dentalclinic=DEBUG
logging.level.org.hibernate.SQL=DEBUG

# DevTools enabled
spring.devtools.restart.enabled=true
```

**application-prod.properties:**
```properties
# Production environment
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# Production logging
logging.level.com.dentalclinic=INFO
logging.level.org.hibernate.SQL=WARN

# DevTools disabled
spring.devtools.restart.enabled=false
```

**Activate profile:**
```bash
# Development
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Production
java -jar dental-clinic-backend.jar --spring.profiles.active=prod
```

### React Environment Variables

**Create .env files:**

**.env.development:**
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_ENV=development
```

**.env.production:**
```
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_ENV=production
```

**Use in code:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});
```

---

## Keyboard Shortcuts Summary Card

### Print This for Quick Reference

```
╔═══════════════════════════════════════════════════════════════╗
║                    VS CODE SHORTCUTS                          ║
╠═══════════════════════════════════════════════════════════════╣
║ Ctrl+P             → Quick file open                          ║
║ Ctrl+Shift+P       → Command palette                          ║
║ Ctrl+`             → Toggle terminal                          ║
║ Ctrl+B             → Toggle sidebar                           ║
║ Ctrl+/             → Toggle comment                           ║
║ Ctrl+D             → Select next occurrence                   ║
║ Alt+Up/Down        → Move line up/down                        ║
║ Ctrl+Space         → Trigger suggestions                      ║
║ F12                → Go to definition                         ║
╠═══════════════════════════════════════════════════════════════╣
║                    STS4 SHORTCUTS                             ║
╠═══════════════════════════════════════════════════════════════╣
║ Ctrl+Shift+T       → Open type (class)                        ║
║ Ctrl+Shift+R       → Open resource (file)                     ║
║ Ctrl+Space         → Auto-complete                            ║
║ Ctrl+1             → Quick fix                                ║
║ Ctrl+Shift+O       → Organize imports                         ║
║ Ctrl+Shift+F       → Format code                              ║
║ Alt+Shift+R        → Rename (refactor)                        ║
║ F3                 → Go to definition                         ║
╠═══════════════════════════════════════════════════════════════╣
║                    REACT SNIPPETS                             ║
╠═══════════════════════════════════════════════════════════════╣
║ rafce + Tab        → Arrow function component                 ║
║ useState + Tab     → useState hook                            ║
║ useEffect + Tab    → useEffect hook                           ║
║ imrs + Tab         → Import React + useState                  ║
║ clg + Tab          → console.log()                            ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Final Pre-Development Checklist

### Before Starting Dental Clinic Project

**Environment Setup:**
```
☐ Java JDK 17+ installed and verified (java -version)
☐ PostgreSQL installed and running
☐ Database 'dental_clinic' created
☐ STS4 installed and launches successfully (Option 3)
☐ VS Code installed with all extensions
☐ Node.js and npm installed (node -v, npm -v)
☐ Git installed (optional but recommended)
```

**IDE Configuration:**
```
☐ STS4 configured with correct memory settings
☐ STS4 workspace created
☐ VS Code extensions installed and verified
☐ VS Code settings.json configured
☐ Prettier and ESLint working in VS Code
☐ React snippets working (test with rafce)
```

**Testing:**
```
☐ Created test Spring Boot project successfully
☐ Can run Spring Boot app and access localhost:8080
☐ Created test React project with Vite
☐ Can run React app and access localhost:5173
☐ Both apps can run simultaneously
```

**Tools:**
```
☐ Postman or Thunder Client ready for API testing
☐ pgAdmin 4 can connect to PostgreSQL
☐ Browser with developer tools ready
```

**Optional but Recommended:**
```
☐ Git repository initialized
☐ .gitignore files created
☐ Backup strategy planned
☐ Code style preferences documented
```

---

## You're Ready!

Once all checkboxes above are complete, you're fully set up and ready to begin **Session 1** of the Dental Clinic Management System project!

### What's Next

**Session 1 Tasks:**
1. Create Spring Boot project with Spring Initializr
2. Configure application.properties for PostgreSQL
3. Create Patient and Appointment entity classes
4. Verify tables are created in database
5. Test basic application startup

**Estimated Time:** 1-2 hours

**You'll use:**
- STS4 for all Java/Spring Boot work
- VS Code for frontend (starting Session 4)
- pgAdmin 4 to verify database changes

---

## Quick Reference Links

### Documentation
- [Spring Boot Docs](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [React Docs](https://react.dev/)
- [VS Code Java](https://code.visualstudio.com/docs/java/java-tutorial)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

### Tutorials
- [Spring Boot REST API](https://spring.io/guides/gs/rest-service/)
- [React Tutorial](https://react.dev/learn)
- [JPA/Hibernate Guide](https://www.baeldung.com/learn-jpa-hibernate)

### Community
- [Stack Overflow](https://stackoverflow.com/) - Tag questions appropriately
- [Spring Boot Discord](https://discord.gg/spring)
- [Reactiflux Discord](https://www.reactiflux.com/)

---

**Good luck with your project! You have a solid development environment configured and ready to build professional software.** 🚀

*Last updated: 2024-01-26*
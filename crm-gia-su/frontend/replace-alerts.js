import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'src/portals/tutor/TutorPortal.tsx',
  'src/portals/tutor/TutorJobs.tsx',
  'src/portals/shared/LeavesManager.tsx',
  'src/portals/client/ParentAttendance.tsx',
  'src/portals/client/MyRequests.tsx',
  'src/portals/client/ClientPortal.tsx',
  'src/portals/admin-crm/SalesMatching.tsx',
  'src/portals/admin-crm/AdminCRM.tsx',
  'src/portals/admin-crm/AcademicDisputes.tsx',
  'src/portals/auth/Login.tsx',
  'src/portals/auth/Register.tsx',
  'src/portals/auth/ForgotPassword.tsx',
  'src/portals/client/RequestTutor.tsx',
  'src/portals/tutor/TutorAttendance.tsx'
];

for (const relPath of filesToUpdate) {
  const filePath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.includes('alert(')) {
    // Replace alert( with toast(
    // We should try to distinguish success vs error if possible based on the text or context, 
    // but toast() works as a fallback. Let's replace simple alert with toast.success or toast.error
    // A heuristic: if it includes "thất bại" or "lỗi", it's an error.
    
    // We will do a generic replacement:
    content = content.replace(/alert\((.*?)\)/g, (match, p1) => {
        if (p1.toLowerCase().includes('thất bại') || p1.toLowerCase().includes('lỗi') || p1.toLowerCase().includes('không')) {
            return `toast.error(${p1})`;
        } else {
            return `toast.success(${p1})`;
        }
    });

    // Add import if not present
    if (!content.includes("import toast from 'react-hot-toast';") && !content.includes('import toast from "react-hot-toast";')) {
      // Find the last import
      const lines = content.split('\n');
      let lastImportIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
          lastImportIndex = i;
        }
      }
      lines.splice(lastImportIndex + 1, 0, "import toast from 'react-hot-toast';");
      content = lines.join('\n');
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${relPath}`);
  }
}

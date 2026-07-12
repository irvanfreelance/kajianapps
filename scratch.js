const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'components', 'admin');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Remove the custom toast state and showToast definitions if they exist
  content = content.replace(/const \[toast, setToast\] = useState<string \| null>\(null\);\n?/g, '');
  content = content.replace(/const showToast = [^\n]+\n(?:[ \t]+setToast[^\n]+\n)?[ \t]+setTimeout[^\n]+\n[ \t]+};\n?/g, '');
  content = content.replace(/const showToast = [^\n]+{ setToast[^\n]+setTimeout[^\n]+};\n?/g, '');
  content = content.replace(/\{toast && <Toast msg=\{toast\} \/>\}\n?/g, '');
  
  // Replace showToast( with toast.success(
  content = content.replace(/showToast\(/g, 'toast.success(');
  
  // Replace alert( with toast.error(
  // We need to be careful with window.confirm, which uses window.confirm("...")
  // But alert("...") is just alert. Let's replace alert( with toast.error(
  content = content.replace(/(?<!window\.)\balert\(/g, 'toast.error(');

  if (content !== originalContent) {
    // Add import { toast } from 'sonner'; if not present
    if (!content.includes("import { toast } from 'sonner';") && !content.includes('import { toast } from "sonner";')) {
      // Find last import statement
      const importMatches = [...content.matchAll(/^import .*?from ['"].*?['"];?$/gm)];
      if (importMatches.length > 0) {
        const lastMatch = importMatches[importMatches.length - 1];
        const insertPos = lastMatch.index + lastMatch[0].length;
        content = content.slice(0, insertPos) + "\nimport { toast } from 'sonner';" + content.slice(insertPos);
      } else {
        content = "import { toast } from 'sonner';\n" + content;
      }
    }
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}

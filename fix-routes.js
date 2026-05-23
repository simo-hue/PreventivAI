const fs = require('fs');

const files = [
  "app/page.tsx",
  "components/requests/request-list-client.tsx",
  "components/requests/request-form.tsx",
  "components/layout/app-shell.tsx",
  "components/public/login-modal.tsx",
  "app/(dashboard)/admin/requests/actions.ts",
  "components/quote/clarification-form.tsx",
  "app/(dashboard)/admin/requests/[id]/page.tsx",
  "app/(auth)/login/page.tsx",
  "components/quote/scenario-dashboard.tsx",
  "components/quote/scenario-detail-client.tsx"
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Replace exact "/requests..." with "/admin/requests..."
    content = content.replace(/"\/requests/g, '"/admin/requests');
    // Replace exact `/requests...` with `/admin/requests...`
    content = content.replace(/`\/requests/g, '`/admin/requests');
    fs.writeFileSync(file, content);
    console.log("Fixed", file);
  } else {
    console.log("Missing", file);
  }
}

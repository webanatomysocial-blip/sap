
const fs = require('fs');
const path = require('path');

// 1. Read posts.js (Naive parsing because it is a JS file, not JSON)
const postsFilePath = path.join(__dirname, '../src/data/posts.js');
const postsContent = fs.readFileSync(postsFilePath, 'utf8');

// Regex to extract the array
const postsMatch = postsContent.match(/export const posts = \[\s*([\s\S]*?)\];/);
if (!postsMatch) {
    console.error("Could not find posts array");
    process.exit(1);
}

// Evaluate the array string to get objects (Unsafe in prod, fine for local migration tool)
// We need to mock the image variables if they are used, but here they are strings?
// Looking at file: image: "/src/assets/..." -> It is a string.
// Let's us eval() carefully or use Function
const postsData = eval(`[${postsMatch[1]}]`);

let sql = `
-- Content Import for SAP Security Expert
-- Generated automatically
INSERT INTO users (id, name, email, password, created_at, updated_at) VALUES 
(1, 'Raghu Boddu', 'raghu.boddu@sapkaphi.in', '$2y$12$E1J2.g1.g1.g1.g1.g1.g1.g1.g1.g1.g1.g1.g1.g1.g1', NOW(), NOW())
ON DUPLICATE KEY UPDATE name=name;

-- Ensure categories are not needed in DB for this simple schema (using string columns)

`;

postsData.reverse().forEach(post => { // Reverse to preserve ID order if needed, or just normal.
    // 2. Read Element Content
    const componentPath = path.join(__dirname, `../src/blog-content/${post.component}.jsx`);
    let content = '';
    
    try {
        const fileContent = fs.readFileSync(componentPath, 'utf8');
        // Regex to find content={ <> ... </> }
        // Match content={...} where ... starts with <> and ends with </>
        // This is tricky. Let's look for `content={<>` and the last `</>}` 
        // Or better: `content={` then match balanced braces?
        // Simple heuristic: content={<> [EVERYTHING] </>}
        const contentMatch = fileContent.match(/content=\{\s*<>([\s\S]*?)<\/>\s*\}/);
        
        if (contentMatch) {
            content = contentMatch[1].trim();
            // Cleanup JSX to HTML
            content = content
                .replace(/className=/g, 'class=')
                .replace(/<p>/g, '<p class="mb-4">') // Add some tailwind/css spacing if needed
                .replace(/<h2>/g, '<h2 class="text-2xl font-bold mt-6 mb-3">')
                .replace(/<h3>/g, '<h3 class="text-xl font-bold mt-4 mb-2">')
                .replace(/'/g, "''"); // Escape single quotes for SQL
        } else {
            console.warn(`No content found for ${post.component}`);
        }

    } catch (e) {
        console.warn(`Checking file ${componentPath}: ${e.message}`);
    }

    // 3. Prepare SQL
    const escape = (str) => str ? `'${str.replace(/'/g, "''")}'` : 'NULL';
    
    // Image Path Fix: /src/assets/blogs/ -> /images/blogs/
    let imagePath = post.image.replace('/src/assets/blogs/', '/images/blogs/');
    // If it doesn't start with /images, prepend / (just in case)
    if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
        imagePath = '/' + imagePath;
    }

    sql += `
INSERT INTO posts (title, slug, author_id, category_id, subcategory_id, excerpt, content, featured_image, status, published_at, created_at, updated_at) VALUES (
${escape(post.title)},
${escape(post.slug)},
1, -- Author ID 1 (Raghu)
${escape(post.category)},
${escape(post.subcategory)},
${escape(post.excerpt)},
${escape(content)},
${escape(imagePath)},
'published',
STR_TO_DATE('${post.date}', '%M %d, %Y'),
NOW(),
NOW()
);
`;

});

const outputPath = path.join(__dirname, '../database_content.sql');
fs.writeFileSync(outputPath, sql);
console.log(`Generated ${outputPath}`);

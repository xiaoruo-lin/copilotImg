//功能：修改生成文件端口3001可换成你想要的端口或用参数从外面传进来，把这个r.js放在项目根目录下，执行yarn build生成后，再执行node r 或 node r 3006
import * as fs from 'node:fs';
import * as path from 'node:path';

// 命令行参数，假设端口号是第三个参数（index 2，因为 argv[0] 是 'node'，argv[1] 是脚本路径）
const newPortStr = process.argv[2] || '3001'; // 如果未提供，则默认为 3001

// 确保端口号是数字
const portNumber = Number(newPortStr);
if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
    console.error('Invalid port number. Please provide a valid port number between 1 and 65535.');
    process.exit(1);
}

// 将数字转换为字符串（如果需要的话），确保它是没有科学记数法的
const newPort = portNumber.toString();

// 更新的正则表达式来匹配包含函数调用的 port 赋值语句
const searchPattern = /const\s+port\s*=\s*(?:\w+\(.*?\)\s*\|\|\s*)?\d+e?\d*;/g;

// 替换模式，使用新的端口号
const replacePattern = `const port = ${newPort};`;

const updateFile = (filePath) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${filePath}`);
            return;
        }
        const updatedData = data.replace(searchPattern, replacePattern);
        fs.writeFile(filePath, updatedData, 'utf8', (err) => {
            if (err) {
                console.error(`Error writing file: ${filePath}`);
                return;
            }
            console.log(`Port replaced in file: ${filePath}`);
        });
    });
};

const replacePortsInFiles = (directoryPath) => {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error(`Error reading directory: ${directoryPath}`);
            return;
        }
        files.forEach((file) => {
            const filePath = path.join(directoryPath, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error(`Error getting file stats: ${filePath}`);
                    return;
                }
                if (stats.isFile() && /\.mjs$/.test(file)) { // 只处理 .mjs 文件
                    updateFile(filePath);
                }
            });
        });
    });
};

const directoryPath = './.output/server/chunks';
replacePortsInFiles(directoryPath);
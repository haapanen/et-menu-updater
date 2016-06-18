/// <reference path="typings/node/node.d.ts" />
/// <reference path="typings/watch/watch.d.ts" />

import * as fs from "fs";
import * as watch from "watch";
import * as path from "path";

interface Config {
    watchDir: string;
    clientDir: string;
}

class Application {
    constructor(argv: string[]) {
        let config: Config = {
            watchDir: undefined,
            clientDir: undefined
        };
        if (argv.length == 0) {
            config = this.readConfig();
            console.log(`Using previous configuration. Watching directory: ${config.watchDir}. Copying files to directory: ${config.clientDir}`);
        } else if (argv.length == 2) {
            config.watchDir = argv[0];
            config.clientDir = argv[1];

            this.saveConfig(config);
        } else {
            console.log("Usage: ./bin/app <watch dir> <client dir>");
            process.exit(1);
        }

        this.copyCurrentFiles(config)
        this.run(config);
    }

    private readConfig(): Config {
        try {
            return JSON.parse(fs.readFileSync("config.json").toString());
        } catch (ex) {
            console.error("Cannot open config.json.");
            process.exit(1);
        } 
    }

    private saveConfig(config: Config) {
        fs.writeFileSync("config.json", JSON.stringify(config, null, 4));
    }

    // copies all files that do not exist in the target dir from the watch dir
    private copyCurrentFiles(config: Config) {
        const watchDirFiles = fs.readdirSync(config.watchDir);
        const clientDirFiles = fs.readdirSync(config.clientDir);

        let numFilesCopied = 0;

        watchDirFiles.forEach(watchDirFile => {
            const originalFilePath = path.join(config.watchDir, watchDirFile);
            if (!clientDirFiles.some(clientDirFile => {
                return clientDirFile === watchDirFile;
            })) {
                const targetFilePath = path.join(config.clientDir, watchDirFile);

                fs.createReadStream(originalFilePath).pipe(fs.createWriteStream(targetFilePath));
                ++numFilesCopied;
            }
        });

        console.log(`Copied ${numFilesCopied} files from ${config.watchDir} to ${config.clientDir}`);
    }

    // starts watching the files and handles the file copy / delete on events
    private run(config: { watchDir: string; clientDir: string; }) {
        watch.createMonitor(config.watchDir, (monitor) => {
            monitor.on("created", (f, stat) => {
                const targetPath = path.join(config.clientDir, path.basename(f));
                fs.createReadStream(f).pipe(fs.createWriteStream(targetPath));
            });

            monitor.on("changed", (f, curr, prev) => {
                const targetPath = path.join(config.clientDir, path.basename(f));
                fs.createReadStream(f).pipe(fs.createWriteStream(targetPath));
            });

            monitor.on("removed", (f, stat) => {
                const targetPath = path.join(config.clientDir, path.basename(f));
                fs.unlink(targetPath);
            });
        });
    }
}

const application = new Application(process.argv.slice(2));
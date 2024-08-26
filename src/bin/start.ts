#!/usr/bin/env node
'use strict';

import express, {type Express} from 'express';
import {Server} from 'http';
import FitnessFirstIcalProxy from '../lib/index.js';


class AppServer {
    static run() {
        new AppServer();
    }

    private app: Express;
    private server: Server;

    constructor() {
        this.app = express();

        this.setupRoutes();
        this.server = this.app.listen(process.env.PORT || 8080);

        process.on('SIGINT', () => this.stop());
        process.on('SIGTERM', () => this.stop());
    }

    setupRoutes() {
        this.app.get('/ping', (req, res) => {
            res.send('pong');
        });

        this.app.get('/ical', (req, res) => {
            FitnessFirstIcalProxy.request(req.query)
                .then(calendar => {
                    res.writeHead(200, {
                        'Content-Type': 'text/calendar; charset=utf-8',
                        'Content-Disposition': 'attachment; filename="calendar.ics"'
                    });

                    res.end(calendar.toString());
                });
        });
    }

    async stop() {
        await new Promise(cb => this.server.close(cb));

        process.exit();
    }
}

AppServer.run();

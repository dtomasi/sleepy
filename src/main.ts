import {app, Menu, MenuItem, Notification, Tray} from 'electron';
import * as path from 'path';
import {execSync} from 'child_process';

let tray: Tray, interval: any, contextMenu: Menu;

// Don't show the app in the dock
app.dock.hide();

app.on('ready', () => {
    tray = new Tray(path.join(__dirname, '../icons/16x16.png'));
    contextMenu = Menu.buildFromTemplate(
        [
            {
                label: 'Abort',
                type: 'normal',
                id: 'abort',
                visible: false,
                click: () => {
                    clearInterval(interval);

                    const abortItem = contextMenu.getMenuItemById('abort');
                    abortItem.visible = false;

                    tray.setTitle('');
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Select time',
                type: 'submenu',
                submenu: Menu.buildFromTemplate(
                    [
                        {
                            label: '15 minutes',
                            type: 'normal',
                            id: '900',
                            click: handleTimeSelection
                        },
                        {
                            label: '30 minutes',
                            type: 'normal',
                            id: '1800',
                            click: handleTimeSelection
                        },
                        {
                            label: '45 minutes',
                            type: 'normal',
                            id: '2700',
                            click: handleTimeSelection
                        },
                        {
                            label: '1 hour',
                            type: 'normal',
                            id: '3600',
                            click: handleTimeSelection
                        },
                        {
                            label: '1,5 hours',
                            type: 'normal',
                            id: '5400',
                            click: handleTimeSelection
                        },
                        {
                            label: '2 hours',
                            type: 'normal',
                            id: '7200',
                            click: handleTimeSelection
                        },
                        {
                            label: '3 hours',
                            type: 'normal',
                            id: '10800',
                            click: handleTimeSelection
                        }

                    ]
                )
            },
            {
                label: 'Quit',
                type: 'normal',
                click: () => {
                    app.exit();
                }
            }
        ]);

    tray.setTitle('');
    tray.setContextMenu(contextMenu);
});

function toTimeString(sec_num: number) {
    const hours = Math.floor(sec_num / 3600);
    const minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    const seconds = sec_num - (hours * 3600) - (minutes * 60);

    return `${String("00" + hours).slice(-2)}:${String("00" + minutes).slice(-2)}:${String("00" + seconds).slice(-2)}`
}

function handleTimeSelection(menuItem: MenuItem) {

    // @ts-ignore
    let value = parseInt(menuItem['id']);
    console.log(`timer set to ${value} seconds`);

    const abortItem = contextMenu.getMenuItemById('abort');
    abortItem.visible = true;

    tray.setTitle(toTimeString(value));

    interval = setInterval(() => {
        if (value === 0) {
            console.log('Go to sleep');
            sleep();
        }

        if (value === 30 && Notification.isSupported()) {
            console.log('Show notification');
            const notification = new Notification(
                {
                    title: '30 seconds remaining',
                    body: 'Computer is going to sleep in 30 seconds'
                }
            );
            notification.show();
        }

        value--;
        tray.setTitle(toTimeString(value));
    }, 1000);
}

function sleep() {
    switch (process.platform) {
        case 'darwin':
            execSync('osascript -e \'tell application "System Events" to sleep\'');
            break;
    }

    app.exit();
}

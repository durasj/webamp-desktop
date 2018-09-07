import path from 'path'
import { Application } from 'spectron'

const baseDir = path.join(__dirname, '../..')
const electronBinary = path.join(
    baseDir,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'electron.cmd' : 'electron'
)

describe('Basic functionality', () => {
    jest.setTimeout(30 * 1000)

    const app = new Application({
        path: electronBinary,
        args: [baseDir],
        requireName: 'spectronRequire',
        env: {
            ELECTRON_IS_DEV: 0,
            NODE_ENV: 'test',
        },
    })

    beforeEach(() => app.start())

    afterEach(() => {
        if (app && app.isRunning()) {
            return app.stop()
        }
    })

    it('Is showing an initial window', async () => {
        const electronWindowCount = await app.client.getWindowCount()
        expect(electronWindowCount).toBe(1)

        const mainExists = await app.client.isExisting('#webamp #main-window')
        expect(mainExists).toBeTruthy()
    })

    it('Allows minimizing of the window', async () => {
        const isMinimized = await app.browserWindow.isMinimized()
        expect(isMinimized).toEqual(false)

        const wasMinimized = await new Promise((resolve) => {
            const eventTimeout = setTimeout(() => resolve(false), 10000)

            app.browserWindow.once('minimize', () => {
                clearTimeout(eventTimeout)
                resolve(true)
            })

            app.client.leftClick('#webamp #minimize')
        })

        expect(wasMinimized).toEqual(true)
    })

    it('Allows closing of the window', async () => {
        const wasClosed = await new Promise((resolve) => {
            const eventTimeout = setTimeout(() => resolve(false), 10000)

            app.browserWindow.once('closed', () => {
                clearTimeout(eventTimeout)
                resolve(true)
            })

            app.client.leftClick('#webamp #close')
        })

        expect(wasClosed).toEqual(true)
    })
})

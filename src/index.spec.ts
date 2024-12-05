import fs from 'fs';
const lib = fs.readFileSync('./dist/index.js', { encoding: 'utf8'});

describe('Main lib checks', () => {
    it('exports DataCollector and PageBuilder', () => {
        const matchResult = lib.match(/export{[a-zA-Z\d]{1,5} as DataCollector,[a-zA-Z\d]{1,5} as PageBuilder}/)
        expect(matchResult).not.toBe(null);
    });
});

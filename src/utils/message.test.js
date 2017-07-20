const expect = require('expect');

var {messageGen, locationGen} = require('./message');

describe("Generate messages", ()=> {
    it('should generate correct message object', ()=> {
        var from = 'julie';
        var content = 'This is a test message';
        var message = messageGen(from, content);

        expect(message.createdAt).toBeA('number');
        expect(message).toInclude({from,content});
    });
});

describe("Generate Location", ()=> {
    it('should generate correct location object', ()=> {
        var from = 'julie';
        var longitude = 15;
        var latitude = 15;
        var url = 'https://www.google.com/maps?q=15,15';
        var location = locationGen(from, longitude, latitude);

        expect(location.createdAt).toBeA('number');
        expect(location).toInclude({from,url});
    });
});
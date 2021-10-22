'use strict';

import FitnessFirstIcalProxy from '../../src/lib';
import assert = require('assert');

describe('FitnessFirstIcalProxy', function () {
    this.timeout(1000 * 10);

    describe('request()', function() {
        it('should work without error', async function () {
            const calendar = await FitnessFirstIcalProxy.request({
                category_id: '431'
            });

            assert.ok(calendar.length() > 0);
        });
    });
});

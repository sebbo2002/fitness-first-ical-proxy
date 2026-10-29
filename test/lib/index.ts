'use strict';

import * as assert from 'assert';

import FitnessFirstIcalProxy from '../../src/lib/index.js';

describe('FitnessFirstIcalProxy', function () {
    this.timeout(1000 * 10);

    describe('request()', function () {
        it('should work without error', async function () {
            const calendar = await FitnessFirstIcalProxy.request({
                category_id: 'aqua',
                club_id: '96',
            });

            assert.ok(calendar.length() > 0);
        });
    });
});

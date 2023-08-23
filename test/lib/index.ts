'use strict';

import FitnessFirstIcalProxy from '../../src/lib/index.js';
import * as assert from 'assert';

describe('FitnessFirstIcalProxy', function () {
    this.timeout(1000 * 10);

    describe('request()', function() {
        it('should work without error', async function () {
            const calendar = await FitnessFirstIcalProxy.request({
                club_id: '0115',
                category_id: '421'
            });

            assert.ok(calendar.length() > 0);
        });
    });
});

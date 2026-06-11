/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Step3_Files_Gpsandfieldsremovedmobile4Inputs */

const en_step3_files_gpsandfieldsremovedmobile4 = /** @type {(inputs: Step3_Files_Gpsandfieldsremovedmobile4Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`GPS + ${i?.count} fields`)
};

const cs_step3_files_gpsandfieldsremovedmobile4 = /** @type {(inputs: Step3_Files_Gpsandfieldsremovedmobile4Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`GPS + ${i?.count} polí`)
};

/**
* | output |
* | --- |
* | "GPS + {count} fields" |
*
* @param {Step3_Files_Gpsandfieldsremovedmobile4Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_files_gpsandfieldsremovedmobile4 = /** @type {((inputs: Step3_Files_Gpsandfieldsremovedmobile4Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Files_Gpsandfieldsremovedmobile4Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_files_gpsandfieldsremovedmobile4(inputs)
	return cs_step3_files_gpsandfieldsremovedmobile4(inputs)
});
export { step3_files_gpsandfieldsremovedmobile4 as "step3.files.gpsAndFieldsRemovedMobile" }
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Step5_Metadata_Totalexposed1Inputs */

const en_step5_metadata_totalexposed1 = /** @type {(inputs: Step5_Metadata_Totalexposed1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} metadata fields were exposed.`)
};

const cs_step5_metadata_totalexposed1 = /** @type {(inputs: Step5_Metadata_Totalexposed1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Celkem ${i?.count} polí metadat bylo odhalitelných.`)
};

/**
* | output |
* | --- |
* | "{count} metadata fields were exposed." |
*
* @param {Step5_Metadata_Totalexposed1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_totalexposed1 = /** @type {((inputs: Step5_Metadata_Totalexposed1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Totalexposed1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_totalexposed1(inputs)
	return cs_step5_metadata_totalexposed1(inputs)
});
export { step5_metadata_totalexposed1 as "step5.metadata.totalExposed" }
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Step1_Upload_Rejectedtoolarge2Inputs */

const en_step1_upload_rejectedtoolarge2 = /** @type {(inputs: Step1_Upload_Rejectedtoolarge2Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} file(s) exceeded the 500 MB size limit`)
};

const cs_step1_upload_rejectedtoolarge2 = /** @type {(inputs: Step1_Upload_Rejectedtoolarge2Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} soubor(ů) přesáhl(o) limit 500 MB`)
};

/**
* | output |
* | --- |
* | "{count} file(s) exceeded the 500 MB size limit" |
*
* @param {Step1_Upload_Rejectedtoolarge2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_rejectedtoolarge2 = /** @type {((inputs: Step1_Upload_Rejectedtoolarge2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_Rejectedtoolarge2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_upload_rejectedtoolarge2(inputs)
	return cs_step1_upload_rejectedtoolarge2(inputs)
});
export { step1_upload_rejectedtoolarge2 as "step1.upload.rejectedTooLarge" }
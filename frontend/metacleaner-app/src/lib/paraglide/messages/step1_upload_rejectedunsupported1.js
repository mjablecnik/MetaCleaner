/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Step1_Upload_Rejectedunsupported1Inputs */

const en_step1_upload_rejectedunsupported1 = /** @type {(inputs: Step1_Upload_Rejectedunsupported1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} file(s) have an unsupported format`)
};

const cs_step1_upload_rejectedunsupported1 = /** @type {(inputs: Step1_Upload_Rejectedunsupported1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} soubor(ů) má nepodporovaný formát`)
};

/**
* | output |
* | --- |
* | "{count} file(s) have an unsupported format" |
*
* @param {Step1_Upload_Rejectedunsupported1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_rejectedunsupported1 = /** @type {((inputs: Step1_Upload_Rejectedunsupported1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_Rejectedunsupported1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_upload_rejectedunsupported1(inputs)
	return cs_step1_upload_rejectedunsupported1(inputs)
});
export { step1_upload_rejectedunsupported1 as "step1.upload.rejectedUnsupported" }
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step1_Upload_Ordragmobile2Inputs */

const en_step1_upload_ordragmobile2 = /** @type {(inputs: Step1_Upload_Ordragmobile2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`or drag files here`)
};

const cs_step1_upload_ordragmobile2 = /** @type {(inputs: Step1_Upload_Ordragmobile2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`nebo přetáhněte soubory sem`)
};

/**
* | output |
* | --- |
* | "or drag files here" |
*
* @param {Step1_Upload_Ordragmobile2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_ordragmobile2 = /** @type {((inputs?: Step1_Upload_Ordragmobile2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_Ordragmobile2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_upload_ordragmobile2(inputs)
	return cs_step1_upload_ordragmobile2(inputs)
});
export { step1_upload_ordragmobile2 as "step1.upload.orDragMobile" }
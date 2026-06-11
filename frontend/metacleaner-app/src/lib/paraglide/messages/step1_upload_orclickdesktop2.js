/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step1_Upload_Orclickdesktop2Inputs */

const en_step1_upload_orclickdesktop2 = /** @type {(inputs: Step1_Upload_Orclickdesktop2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`or click to select from device`)
};

const cs_step1_upload_orclickdesktop2 = /** @type {(inputs: Step1_Upload_Orclickdesktop2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`nebo klikněte pro výběr ze zařízení`)
};

/**
* | output |
* | --- |
* | "or click to select from device" |
*
* @param {Step1_Upload_Orclickdesktop2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_orclickdesktop2 = /** @type {((inputs?: Step1_Upload_Orclickdesktop2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_Orclickdesktop2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_upload_orclickdesktop2(inputs)
	return cs_step1_upload_orclickdesktop2(inputs)
});
export { step1_upload_orclickdesktop2 as "step1.upload.orClickDesktop" }
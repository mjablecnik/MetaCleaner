/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step3_Status_Inprogress1Inputs */

const en_step3_status_inprogress1 = /** @type {(inputs: Step3_Status_Inprogress1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`In progress`)
};

const cs_step3_status_inprogress1 = /** @type {(inputs: Step3_Status_Inprogress1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Probíhá`)
};

/**
* | output |
* | --- |
* | "In progress" |
*
* @param {Step3_Status_Inprogress1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_status_inprogress1 = /** @type {((inputs?: Step3_Status_Inprogress1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Status_Inprogress1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_status_inprogress1(inputs)
	return cs_step3_status_inprogress1(inputs)
});
export { step3_status_inprogress1 as "step3.status.inProgress" }
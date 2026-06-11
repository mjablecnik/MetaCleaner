/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step3_Files_Waitinginqueue2Inputs */

const en_step3_files_waitinginqueue2 = /** @type {(inputs: Step3_Files_Waitinginqueue2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Waiting in queue`)
};

const cs_step3_files_waitinginqueue2 = /** @type {(inputs: Step3_Files_Waitinginqueue2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Čeká ve frontě`)
};

/**
* | output |
* | --- |
* | "Waiting in queue" |
*
* @param {Step3_Files_Waitinginqueue2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_files_waitinginqueue2 = /** @type {((inputs?: Step3_Files_Waitinginqueue2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Files_Waitinginqueue2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_files_waitinginqueue2(inputs)
	return cs_step3_files_waitinginqueue2(inputs)
});
export { step3_files_waitinginqueue2 as "step3.files.waitingInQueue" }
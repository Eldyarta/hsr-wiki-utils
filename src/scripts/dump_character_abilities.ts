import { mkdir, writeFile } from 'node:fs/promises';
import { ChangeHistory } from '../ChangeHistory.js';
import { Character } from '../character/Character.js';
import { sanitizeString } from '../Shared.js';
import { TextMap } from '../TextMap.js';
import { pageInfoHeader, uploadPrompt } from '../util/General.js';
import { teardown } from '../util/JSONParser.js';
import { Template } from '../util/Template.js';

for (const character of Character.allReleased()) {
	let characterWithPath = character.name
	
	if (character.name == '(Trailblazer)') {
		characterWithPath = `Traiblazer (${character.path_display})`
	} else if (character.name == 'March 7th') {
		characterWithPath = `March 7th (${character.path_display})`
	}
	
	const abilities = character.getAbilities()
	
	const characterAdded = (await ChangeHistory.character.findAdded(character.id))[0]
	
	const parentFolder = `./output/characters/${characterWithPath}-${character.id}`
	
	await mkdir(`${parentFolder}/ability`, { recursive: true })
	await mkdir(`${parentFolder}/trace`, { recursive: true })
	await mkdir(`${parentFolder}/eidolon`, { recursive: true })
	
	// MAIN ABILITIES //
	for (const ability of abilities) {
		const output: string[] = [
			pageInfoHeader(ability.name),
		]
		
		let toughnessDisplay: string[] = []
		if (ability.toughness_main > 0) {
			toughnessDisplay.push(`${ability.toughness_main / 3}${!ability.single_toughness ? ' (Main)' : ''}`)
		}
		if (ability.toughness_adjacent > 0) {
			toughnessDisplay.push(`${ability.toughness_adjacent / 3}${!ability.toughness_adjacent ? ' (Adjacent)' : ''}`)
		}
		if (ability.toughness_aoe > 0) {
			toughnessDisplay.push(`${ability.toughness_aoe / 3}${!ability.toughness_aoe ? ' (AoE)' : ''}`)
		}
		
		const infobox = new Template('Ability Infobox', {
			title: ability.name,
			image: `Ability ${ability.name}.png${uploadPrompt(ability.icon_path_ult || ability.icon_path, `Ability ${ability.name}.png`, `${character.name} Ability Icons`)}`,
			character: characterWithPath,
			type: ability.type_display,
			tag: ability.tag_display,
			toughdmg: toughnessDisplay.join('<br />'),
			energyGen: ability.energy_generation || '',
			energyCost: ability.energy_cost || '',
			duration: '',
			desc: ability.description.replaceAll('\n', '<br />'),
			utility1: '',
			utility2: '',
			utility3: '',
			utility4: '',
			scale_att1: '',
		})
		
		const hasMultipleOfType = abilities.find(otherAbility => otherAbility.type == ability.type && otherAbility != ability)
		
		output.push(
			infobox.block(),
			`'''${ability.name}''' is ${hasMultipleOfType ? 'one of ' : ''}[[${character.name}]]'s [[${ability.type_display}]]${hasMultipleOfType ? 's' : ''}.`,
			'<!--',
			'==Gameplay Notes==',
			'--><!--',
			'==Preview==',
			'{{Preview',
			`|file = ${ability.name} Preview`,
			'}}',
			'-->',
			'==Scaling==',
			ability.getScalingTable() ?? '',
			'',
			'==Other Languages==',
			await TextMap.generateOL(ability.name_hash),
			'',
			'==Change History',
			`{{Change History|${characterAdded}}}`,
			'',
			'==Navigation==',
			'{{Ability Navbox}}',
		)
		
		await writeFile(`${parentFolder}/ability/${ability.type_display}-${sanitizeString(ability.name)}.wikitext`, output.join('\n'))
	}

	// TRACES //
	for (const trace of character.getTraces()) {
		const output: string[] = [
			pageInfoHeader(trace.name),
		]

		const infobox = new Template('Ability Infobox', {
			title: trace.name,
			image: `Trace ${trace.name}.png${uploadPrompt(trace.icon_path, `Trace ${trace.name}.png`, `${character.name} Trace Icons`)}`,
			character: characterWithPath,
			type: 'Bonus Ability',
			reqAsc: trace.required_ascension,
			duration: '',
			desc: trace.description.replaceAll('\n', '<br />'),
			utility1: '',
			utility2: '',
			utility3: '',
			utility4: '',
			scale_att1: '',
		})

		output.push(
			infobox.block(),
			`'''${trace.name}''' is [[${character.name}]]'s Ascension ${trace.required_ascension} [[Bonus Ability]].`,
			'<!--',
			'==Gameplay Notes==',
			'--><!--',
			'==Preview==',
			'{{Preview',
			`|file = ${trace.name} Preview`,
			'}}',
			'-->',
			'==Other Languages==',
			await TextMap.generateOL(trace.name_hash),
			'',
			'==Change History',
			`{{Change History|${characterAdded}}}`,
			'',
			'==Navigation==',
			'{{Ability Navbox}}',
		)

		await writeFile(`${parentFolder}/trace/${trace.required_ascension}-${sanitizeString(trace.name)}.wikitext`, output.join('\n'))
	}

	// EIDOLONS //
	for (const eidolon of character.getEidolons()) {
		const output: string[] = [
			pageInfoHeader(eidolon.name),
		]

		const infobox = new Template('Eidolon Infobox', {
			title: eidolon.name,
			image: `Eidolon ${eidolon.name}.png${uploadPrompt(eidolon.icon_path, `Eidolon ${eidolon.name}.png`, `${character.name} Eidolon Icons`)}`,
			character: characterWithPath,
			level: eidolon.level,
			duration: '',
			desc: eidolon.description.replaceAll('\n', '<br />'),
			utility1: '',
			utility2: '',
			utility3: '',
			utility4: '',
			scale_att1: '',
		})

		output.push(
			infobox.block(),
			`'''${eidolon.name}''' is [[${character.name}]]'s Level ${eidolon.level} Eidolon.`,
			'<!--',
			'==Gameplay Notes==',
			'--><!--',
			'==Preview==',
			'{{Preview',
			`|file = ${eidolon.name} Preview`,
			'}}',
			'-->',
			'==Other Languages==',
			await TextMap.generateOL(eidolon.name_hash),
			'',
			'==Change History',
			`{{Change History|${characterAdded}}}`,
			'',
			'==Navigation==',
			'{{Ability Navbox}}',
		)

		await writeFile(`${parentFolder}/eidolon/${eidolon.level}-${sanitizeString(eidolon.name)}.wikitext`, output.join('\n'))
	}
	
	console.log(`Finished for ${characterWithPath}`)
}

console.log('Finished all characters')

teardown()
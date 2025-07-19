import { useState, useMemo } from 'react';
import countries from 'world-countries';
import ReactCountryFlag from "react-country-flag";

interface Country {
	name: string;
	code: string;
	officialName: string;
}

interface NationalityDropdownProps {
	value: string;
	onChange: (value: string) => void;
}

const NationalityDropdown = ({ value, onChange }: NationalityDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

	const countriesData = useMemo(() => {
		return countries
			.map(country => ({
				name: country.name.common,
				code: country.cca2, // ISO 3166-1 alpha-2 code
				officialName: country.name.official
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	}, []);

	// console.log(countriesData)

	const filteredCountries = useMemo(() => {
		return countriesData.filter(country =>
			country.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [countriesData, searchTerm]);

	const selectedCountry = countriesData.find(c => c.code === value);

	const handleCountrySelect = (country: Country) => {
		onChange(country.code);
		setIsOpen(false);
		setSearchTerm('');
	};

	return (
		<div className="relative">
			<div
				className="input-primary cursor-pointer flex items-center justify-between"
				onClick={() => setIsOpen(!isOpen)}
			>
				<span className="flex items-center gap-3">
					{selectedCountry ? (
						<>
							<ReactCountryFlag
								countryCode={selectedCountry.code}
								svg
								style={{
									width: '1.5em',
									height: '1.5em',
								}}
								title={selectedCountry.name}
							/>
							<span>{selectedCountry.name}</span>
						</>
					) : (
						<span className="text-gray-400">Select your nationality</span>
					)}
				</span>
				<span className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
					▼
				</span>
			</div>

			{/* Dropdown menu */}
			{isOpen && (
				<>
					{/* Backdrop to close dropdown */}
					<div
						className="fixed inset-0 z-10"
						onClick={() => setIsOpen(false)}
					/>

					<div className="fixed z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-[80vh] overflow-hidden">
						{/* Search input */}
						<div className="p-2 border-b border-gray-600">
							<input
								type="text"
								placeholder="Search countries..."
								className="w-full p-2 bg-gray-700 text-white rounded border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onClick={(e) => e.stopPropagation()}
							/>
						</div>

						{/* Countries list */}
						<div className="overflow-y-auto max-h-64">
							{filteredCountries.length > 0 ? (
								filteredCountries.map((country) => (
									<div
										key={country.code}
										className="p-3 hover:bg-gray-700 cursor-pointer flex items-center gap-3 text-white transition-colors"
										onClick={() => handleCountrySelect(country)}
									>
										<ReactCountryFlag
											countryCode={country.code}
											svg
											style={{
												width: '1.5em',
												height: '1.5em',
											}}
											title={country.name}
										/>
										<span>{country.name}</span>
									</div>
								))
							) : (
								<div className="p-3 text-gray-400 text-center">
									No countries found
								</div>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default NationalityDropdown;
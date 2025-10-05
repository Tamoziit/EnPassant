interface OpeningProps {
	opening: string;
}

const Opening = ({ opening }: OpeningProps) => {
	return (
		<div className="flex w-full items-center justify-center">
			<span className="text-gray-500 text-sm md:text-base">{opening}</span>
		</div>
	)
}

export default Opening;
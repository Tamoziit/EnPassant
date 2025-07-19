import { Link } from "react-router-dom"

const About = () => {
	return (
		<div id="about" className="mt-8 w-full items-center justify-center p-4">
			<div className="w-full flex flex-col gap-1 items-center justify-center">
				<h1 className="text-[39px] lg:text-[50px] text-secondary">About</h1>
				<p className="text-subhead">What is Pheonix? Know about Us!</p>
			</div>

			<div className="flex flex-col lg:flex-row gap-4 lg:gap-8 mt-10 items-center justify-center">
				<img src="/about.jpg" alt="about" className="w-[60%] lg:w-[45%] z-20" />

				<div className="flex flex-col items-center justify-center lg:items-start gap-2 mt-5 lg:mt-0">
					<h1 className="text-tertiary text-4xl lg:text-5xl">Welcome to <span className="!text-blue-400">Pheonix</span></h1>
					<p className="para lg:!text-left">
						Lorem, ipsum dolor sit amet consectetur adipisicing elit. Accusamus necessitatibus esse odio earum eos culpa, repellat hic sed nam qui nihil consequatur dignissimos itaque, temporibus accusantium obcaecati, ipsa eius! Voluptates.
					</p>

					<div className="w-full flex items-center justify-center mt-2">
						<Link to="/signup" className="btn-primary py-3 px-8">Get Started</Link>
					</div>
				</div>
			</div>
		</div>
	)
}

export default About
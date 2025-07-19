import Footer from "../../components/Footer";
import About from "../../components/landing/About";
import Contact from "../../components/landing/Contact";
import LandingNavbar from "../../components/navbars/LandingNavbar";
import { motion } from "framer-motion";

const Landing = () => {
	return (
		<>
			<LandingNavbar />

			<div
        className="relative pt-20 lg:pt-32 p-4 flex flex-col items-center justify-center w-full h-screen overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat"
        >
          <div className="absolute inset-0 bg-black/65"></div>
        </div>

				<div
          className="relative z-10 flex items-center justify-center flex-col gap-3"
        >
          <motion.img
            src="/Logo.png"
            alt="logo"
            className="w-60 lg:w-80 -mt-20 -mb-10 z-10"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <motion.h1
            className="text-primary text-[70px] lg:text-[90px] z-10"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          >
            Pheonix
          </motion.h1>
          <p className="text-subhead text-center max-w-lg">
            ... ✨ Tagline here ✨ ...
          </p>
        </div>
			</div>

			<About />
			<Contact />
			<Footer />
		</>
	)
}

export default Landing
const FinalCTA =() => {
    return(
        <section className="bg-[#788585] text-white py-16 px-4 text-center">
            <div className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-4xl md:text-5xl  text-white font-extrabold leading-tight">
                    Ready to Transform  Governance?
                </h2>
                <p className="text-lg md:text-xl text-teal-100"> 
                    Start using SmartPolitician today and simplify how you handle constituency requests and manage your team’s efforts.
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                    <a 
                    href="/signup"
                    className="bg-white text-teal-700 font-semibold px-6 py-3 rounded-full shadow hover:bg-teal-100 transition "
                    >
                        Start Free Trial
                    </a>
                    <a 
                    href="#contact"
                    className="border-2 border-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-teal-700 transition"
                    >
                        Contact Sales
                    </a>

                </div>
            </div>

        </section>
    )
}
export default FinalCTA;
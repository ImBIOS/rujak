use rujak::{cpu, fmt, reporter, run_benchmarks};

fn main() {
    let rujak = clap::Command::new("rujak");

    let matches = rujak
        .arg_required_else_help(true)
        .arg(
            clap::Arg::new("benchmark")
                .required(true)
                .forbid_empty_values(true)
                .multiple_occurrences(true),
        )
        .get_matches();

    let benchmarks: Vec<String> = matches
        .values_of("benchmark")
        .unwrap()
        .map(|x| x.to_string())
        .collect();
    let mut options =
        reporter::Options::new(&benchmarks.iter().map(|x| x.as_str()).collect::<Vec<&str>>());

    options.percentiles = false;
    let results = run_benchmarks(benchmarks);

    println!(
        "{}",
        fmt::color(&format!("cpu: {}", cpu::name()), fmt::Color::Gray)
    );
    println!(
        "{}\n",
        fmt::color(
            &format!("runtime: shell ({})", env!("TARGET")),
            fmt::Color::Gray
        )
    );

    println!("{}", reporter::header(&options));

    println!("{}", reporter::br(&options));

    // Print the results
    for result in &results {
        println!(
            "{}",
            reporter::benchmark(&result.name, &result.stats, &options)
        );
    }

    println!("\n{}", reporter::summary(&results, &options));
}

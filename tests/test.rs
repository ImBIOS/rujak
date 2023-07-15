#[cfg(test)]
mod tests {
    use crate::parse_arguments;
    use rujak::run_benchmarks;

    #[test]
    fn test_run_benchmarks() {
        // Run a benchmark on the echo command and check the results
        let benchmarks = vec!["echo hello".to_string()];
        let results = run_benchmarks(benchmarks);
        assert_eq!(results.len(), 1);
    }

    #[test]
    fn test_parse_arguments() {
        let args = vec![
            "rujak", // program name
            "\"echo 'Hello, World!'\"",
            "\"echo 'Hi!'\"",
        ];

        // Temporarily replace the program's command-line arguments
        let original_args = std::env::args().collect::<Vec<_>>();
        std::env::set_var("ARGS", args.join(" "));

        // Parse the arguments and check the result
        let matches = parse_arguments();
        assert!(matches.is_present("benchmark"));
        assert_eq!(matches.value_of("benchmark"), Some("my_benchmark"));

        // Restore the original command-line arguments
        std::env::set_var("ARGS", original_args.join(" "));
    }
}

fn parse_arguments() -> clap::ArgMatches {
    let rujak = clap::Command::new("rujak");

    rujak
        .arg_required_else_help(true)
        .arg(
            clap::Arg::new("benchmark")
                .required(true)
                .forbid_empty_values(true)
                .multiple_occurrences(true),
        )
        .get_matches()
}

import chalk from "chalk";

export function methodColor(method: string, id?: string) {
    switch (method) {
        case "GET":
            return id ? chalk.whiteBright.bgBlue(" GET ONE ") : chalk.whiteBright.bgGreen(" GET ")
        case "POST":
            return chalk.whiteBright.bgYellow(" CREATE ")
        case "PUT":
            return chalk.whiteBright.bgMagenta(" UPDATE ")
        case "DELETE":
            return chalk.whiteBright.bgGreen(" DELETE ")
    }
    return chalk.bgGray.whiteBright(" " + method.toUpperCase() + " ")
}
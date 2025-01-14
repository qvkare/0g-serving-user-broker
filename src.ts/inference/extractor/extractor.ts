import { ServiceStructOutput } from '../../contract/inference'

export abstract class Extractor {
    abstract getSvcInfo(): Promise<ServiceStructOutput>
    abstract getInputCount(content: string): Promise<number>
    abstract getOutputCount(content: string): Promise<number>
}

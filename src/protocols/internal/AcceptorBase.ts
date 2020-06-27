/** 
 * @packageDocumentation
 * @module tgrid.protocols
 */
//----------------------------------------------------------------
import { Communicator } from "../../components/Communicator";

import { DomainError } from "tstl/exception/DomainError";
import { RuntimeError } from "tstl/exception/RuntimeError";

/**
 * Basic Acceptor.
 * 
 * The `AcceptorBase` is an abstract acceptor class, who can accept or reject connection from 
 * a remote client in the server side. If the client's connection has been accepted, the 
 * `AcceptorBase` can start interaction with the client through the RFC (Remote Function Call).
 * 
 * @template Headers Type of headers containing initialilzation data like activation.
 * @template Provider Type of features provided for remote system.
 * @author Jeongho Nam - https://github.com/samchon
 */
export abstract class AcceptorBase<
        Headers extends object | null, 
        Provider extends object | null>
    extends Communicator<Provider | null | undefined>
{
    /**
     * @hidden
     */
    private readonly headers_: Headers;

    /**
     * @hidden
     */
    protected state_: AcceptorBase.State;

    /* ----------------------------------------------------------------
        ACCEPTIONS
    ---------------------------------------------------------------- */
    /**
     * @hidden
     */
    protected constructor(headers: Headers)
    {
        super(undefined);

        this.headers_ = headers;
        this.state_ = AcceptorBase.State.NONE;
    }

    /**
     * Accept connection.
     * 
     * Accepts (permits) the client's connection with this server and starts interaction.
     * 
     * @param provider An object providing features for remote system.
     */
    protected abstract accept(provider: Provider | null): Promise<void>;

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    /**
     * Headers containing initialization data like activation.
     */
    public get headers(): Headers
    {
        return this.headers_;
    }

    /**
     * Connection state with the client.
     */
    public get state(): AcceptorBase.State
    {
        return this.state_;
    }

    /**
     * @hidden
     */
    protected inspectReady(method: string): Error | null
    {
        // NO ERROR
        if (this.state_ === AcceptorBase.State.OPEN)
            return null;

        // ERROR, ONE OF THEM
        else if (this.state_ === AcceptorBase.State.NONE)
            return new DomainError(`Error on ${this.constructor.name}.${method}(): not accepted yet.`);
        else if (this.state_ === AcceptorBase.State.ACCEPTING)
            return new DomainError(`Error on ${this.constructor.name}.${method}(): it's on accepting, wait for a second.`);
        else if (this.state_ === AcceptorBase.State.REJECTING || AcceptorBase.State.CLOSING)
            return new RuntimeError(`Error on ${this.constructor.name}.${method}(): the connection is on closing.`);
        else if (this.state_ === AcceptorBase.State.CLOSED)
            return new RuntimeError(`Error on ${this.constructor.name}.${method}(): the connection has been closed.`);

        // UNKNOWN ERROR, IT MAY NOT OCCURED
        else
            return new RuntimeError(`Error on ${this.constructor.name}.${method}(): unknown error, but not connected.`);
    }
}

export namespace AcceptorBase
{
    export const enum State
    {
        REJECTING = -2,
        NONE,
        ACCEPTING,
        OPEN,
        CLOSING,
        CLOSED
    }
}
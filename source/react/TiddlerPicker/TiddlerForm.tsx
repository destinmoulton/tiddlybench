import React from "react";
import _ from "lodash";
import md5 from "md5";
import notify from "../../lib/notify";
import urlhashparser from "../../lib/helpers/urlhashparser";

import { TBContext } from "../TBContext";
import { IDispatchOptions } from "../../types";

import {
    EContextType,
    EDestinationTiddler,
    EDispatchAction,
    EDispatchSource,
} from "../../enums";
type FormState = {
    tiddlerTitle: string;
    tags: string;
};
type FormProps = {
    isButtonEnabled: boolean;
    isFullFormVisible: boolean;
    handleChangeFilter: (newFilterText: string) => void;
};

class TiddlerForm extends React.Component<FormProps, FormState> {
    static contextType = TBContext;
    filterInput: React.RefObject<HTMLInputElement>;
    constructor(props: FormProps) {
        super(props);

        this.state = {
            tiddlerTitle: "",
            tags: "",
        };
        this.handleChangeTiddlerTitle = this.handleChangeTiddlerTitle.bind(
            this
        );
        this.handleChangeTags = this.handleChangeTags.bind(this);
        this.handleClickAddTiddler = this.handleClickAddTiddler.bind(this);
        this.filterInput = React.createRef();
    }
    componentDidMount() {
        if (this.filterInput && this.filterInput.current) {
            this.filterInput.current.focus();
        }
    }

    private handleChangeTiddlerTitle(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ tiddlerTitle: e.target.value });

        this.props.handleChangeFilter(e.target.value);
    }
    private handleChangeTags(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ tags: e.target.value });
    }

    private buildFilterBox() {
        return (
            <div>
                <input
                    type="text"
                    id="tb-tp-filter-input"
                    placeholder="Start typing the name of the tiddler..."
                    value={this.state.tiddlerTitle}
                    onChange={this.handleChangeTiddlerTitle}
                    ref={this.filterInput}
                />
            </div>
        );
    }

    private handleClickAddTiddler() {
        const { tiddlerTitle, tags } = this.state;
        const cacheID = urlhashparser.getHashParamValue("cache_id");
        if (!cacheID) {
            throw new Error(
                "TiddlerList :: handleClickTiddler() :: cache_id not set as a hash parameter in the URI"
            );
        }
        const message: IDispatchOptions = {
            source: EDispatchSource.TAB,
            action: EDispatchAction.ADD_TIDDLER_WITH_TEXT,
            destination: EDestinationTiddler.CUSTOM,
            context: EContextType.SELECTION,
            packet: {
                cache_id: cacheID,
                tiddler_title: tiddlerTitle,
                tiddler_tags: tags,
            },
        };
        this.context.messenger.send(message, async (response: any) => {
            if (response.ok) {
                await this.context.contextMenuStorage.removeCacheByID(cacheID);

                // Add the new tiddler to the context menu
                await this.context.contextMenuStorage.addCustomDestination({
                    title: tiddlerTitle,
                    tb_id: md5(tiddlerTitle),
                });
                notify(response.message);
                await this.context.tabsManager.closeThisTab();
            }
        });
    }

    private buildLowerForm() {
        const { isButtonEnabled } = this.props;
        const { tags } = this.state;
        let formClass = this.props.isFullFormVisible
            ? "animate-fade-in"
            : "animate-hidden";
        return (
            <div id="tb-tp-form-end-container" className={formClass}>
                <div className="tb-tp-form-tags-container">
                    <div className="tb-tp-form-tags-left">Tiddler Tags:</div>
                    <div className="tb-tp-form-tags-right">
                        <input
                            type="text"
                            id="tb-tp-tags-input"
                            onChange={this.handleChangeTags}
                            value={tags}
                        />
                    </div>
                    <div className="tb-tp-form-tags-info">
                        Wrap multi-word tags in [[]]. ie [[camping equipment]]
                    </div>
                </div>
                <div className="tb-tp-form-button-container">
                    <button
                        id="tb-tp-add-tiddler-button"
                        disabled={!isButtonEnabled}
                        onClick={this.handleClickAddTiddler}
                    >
                        Add Tiddler
                    </button>
                </div>
            </div>
        );
    }
    render() {
        let upperForm = this.buildFilterBox();
        let lowerForm = this.buildLowerForm();
        return (
            <div id="tb-tp-form-container">
                {upperForm}
                {lowerForm}
            </div>
        );
    }
}

export default TiddlerForm;

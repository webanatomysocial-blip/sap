import React, { useRef, useEffect } from "react";
import "../../css/AdminDashboard.css"; // Ensure styling

const SimpleRTE = ({ value, onChange, onImageUpload }) => {
  const editorRef = useRef(null);
  const [isSourceView, setIsSourceView] = React.useState(false);

  useEffect(() => {
    if (
      editorRef.current &&
      editorRef.current.innerHTML !== value &&
      !isSourceView
    ) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, isSourceView]);

  const execCmd = (command, value = null) => {
    if (isSourceView) return; // Disable commands in source view
    document.execCommand(command, false, value);
    handleChange();
  };

  const handleChange = () => {
    if (editorRef.current && !isSourceView) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleSourceChange = (e) => {
    onChange(e.target.value);
  };

  const toggleSourceView = () => {
    setIsSourceView(!isSourceView);
  };

  const handleImageClick = () => {
    if (isSourceView) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file && onImageUpload) {
        const url = await onImageUpload(file);
        if (url) {
          execCmd("insertImage", url);
        }
      }
    };
    input.click();
  };

  return (
    <div className="simple-rte">
      <div className="rte-toolbar">
        <button
          type="button"
          onClick={() => execCmd("formatBlock", "H2")}
          title="Heading 2"
          disabled={isSourceView}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCmd("formatBlock", "H3")}
          title="Heading 3"
          disabled={isSourceView}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => execCmd("formatBlock", "H4")}
          title="Heading 4"
          disabled={isSourceView}
        >
          H4
        </button>
        <div className="rte-divider"></div>
        <button
          type="button"
          onClick={() => execCmd("bold")}
          title="Bold"
          disabled={isSourceView}
        >
          <b>B</b>
        </button>
        <button
          type="button"
          onClick={() => execCmd("italic")}
          title="Italic"
          disabled={isSourceView}
        >
          <i>I</i>
        </button>
        <button
          type="button"
          onClick={() => execCmd("underline")}
          title="Underline"
          disabled={isSourceView}
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onClick={() => execCmd("strikeThrough")}
          title="Strikethrough"
          disabled={isSourceView}
        >
          <s>S</s>
        </button>
        <div className="rte-divider"></div>
        <button
          type="button"
          onClick={() => execCmd("insertUnorderedList")}
          title="Bullet List"
          disabled={isSourceView}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => execCmd("insertOrderedList")}
          title="Ordered List"
          disabled={isSourceView}
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => execCmd("formatBlock", "blockquote")}
          title="Quote"
          disabled={isSourceView}
        >
          ❝ Quote
        </button>
        <div className="rte-divider"></div>
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter Link URL:");
            if (url) execCmd("createLink", url);
          }}
          title="Link"
          disabled={isSourceView}
        >
          🔗 Link
        </button>
        <button
          type="button"
          onClick={() => execCmd("unlink")}
          title="Unlink"
          disabled={isSourceView}
        >
          ⛓ Unlink
        </button>
        <button
          type="button"
          onClick={handleImageClick}
          title="Insert Image"
          disabled={isSourceView}
        >
          🖼️ Image
        </button>
        <div className="rte-divider"></div>
        <button
          type="button"
          onClick={() => execCmd("removeFormat")}
          title="Clear Format"
          disabled={isSourceView}
        >
          ✕ Clear
        </button>
        <div className="rte-divider"></div>
        <button
          type="button"
          onClick={toggleSourceView}
          title={isSourceView ? "WYSIWYG Mode" : "Source Code Mode"}
          className={isSourceView ? "active-toolbar-btn" : ""}
          style={{
            marginLeft: "auto",
            backgroundColor: isSourceView ? "#e2e8f0" : "transparent",
            color: isSourceView ? "#2563eb" : "#475569",
          }}
        >
          {isSourceView ? "👁 View" : "</> Source"}
        </button>
      </div>
      {isSourceView ? (
        <textarea
          className="rte-source-textarea"
          value={value}
          onChange={handleSourceChange}
          placeholder="Type or paste HTML here..."
        />
      ) : (
        <div
          className="rte-content"
          contentEditable
          ref={editorRef}
          onInput={handleChange}
          onBlur={handleChange}
        />
      )}

      <style>{`
        .simple-rte {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: #fff;
            display: flex;
            flex-direction: column;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            overflow: hidden;
        }
        .rte-toolbar {
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            padding: 8px 12px;
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            align-items: center;
        }
        .rte-divider {
            width: 1px;
            height: 20px;
            background: #cbd5e1;
            margin: 0 4px;
        }
        .rte-toolbar button {
            background: transparent;
            border: 1px solid transparent;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            color: #475569;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .rte-toolbar button:hover {
            background: #e2e8f0;
            color: #1e293b;
            border-color: #cbd5e1;
        }
        .rte-content {
            min-height: 350px;
            max-height: 600px;
            overflow-y: auto;
            padding: 20px;
            outline: none;
            font-size: 16px;
            line-height: 1.6;
            color: #334155;
        }
        .rte-content:focus {
            background: #fafafa;
        }
        .rte-source-textarea {
            width: 100%;
            min-height: 400px;
            padding: 20px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
            font-size: 14px;
            line-height: 1.5;
            color: #1e293b;
            background: #1e293b;
            color: #e2e8f0;
            border: none;
            outline: none;
            resize: vertical;
        }
        .rte-content h2 { font-size: 1.75em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; margin-top: 1em; }
        .rte-content h3 { font-size: 1.5em; margin-top: 1em; }
        .rte-content h4 { font-size: 1.25em; margin-top: 1em; }
        .rte-content p { margin-bottom: 1em; }
        .rte-content ul, .rte-content ol { padding-left: 1.5em; margin-bottom: 1em; }
        .rte-content blockquote { border-left: 4px solid #3b82f6; padding-left: 1em; margin-left: 0; color: #64748b; font-style: italic; background: #f8fafc; padding: 10px; }
        .rte-content img { max-width: 100%; height: auto; border-radius: 4px; margin: 10px 0; }
        .rte-content a { color: #2563eb; text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default SimpleRTE;

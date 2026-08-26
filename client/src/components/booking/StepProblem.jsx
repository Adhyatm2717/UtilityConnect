import { useRef } from 'react';

function StepProblem({ description, onDescriptionChange, images, onImagesChange }) {
  const fileInputRef = useRef(null);

  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    onImagesChange([...images, ...newImages]);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    onImagesChange([...images, ...newImages]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function removeImage(index) {
    const updated = images.filter((_, i) => i !== index);
    onImagesChange(updated);
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Problem Description */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
        <h3 className="text-[18px] font-semibold text-on-surface mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">description</span>
          Describe the Problem
        </h3>
        <p className="text-[13px] text-on-surface-variant mb-4">
          Help the provider understand what needs to be done.
        </p>

        <textarea
          id="booking-problem-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="E.g., The ceiling fan in the bedroom is making a grinding noise and wobbles during operation..."
          rows={5}
          className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-[14px] text-on-surface placeholder:text-outline resize-none focus:border-primary outline-none transition-colors leading-relaxed"
        />
        <div className="flex justify-between items-center mt-2">
          <p className={`text-[12px] ${description.length < 10 ? 'text-on-surface-variant' : 'text-secondary'}`}>
            {description.length < 10
              ? `Minimum 10 characters (${10 - description.length} more needed)`
              : '✓ Looks good'}
          </p>
          <span className="text-[12px] text-on-surface-variant">{description.length} / 500</span>
        </div>
      </div>

      {/* Image Upload */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
        <h3 className="text-[18px] font-semibold text-on-surface mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">add_a_photo</span>
          Upload Photos
          <span className="text-[13px] font-normal text-on-surface-variant ml-1">(optional)</span>
        </h3>
        <p className="text-[13px] text-on-surface-variant mb-4">
          Photos help the provider assess the issue before arriving.
        </p>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-primary/3 transition-all duration-200"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[28px]">cloud_upload</span>
          </div>
          <div className="text-center">
            <p className="text-[14px] font-medium text-on-surface">
              Drag & drop photos here
            </p>
            <p className="text-[13px] text-on-surface-variant mt-1">
              or <span className="text-primary font-medium">browse files</span>
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
            {images.map((img, index) => (
              <div key={index} className="relative group rounded-xl overflow-hidden aspect-square border border-outline-variant">
                <img src={img.preview} alt={img.name} className="w-full h-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                  className="absolute top-1 right-1 w-6 h-6 bg-error text-on-error rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                  <p className="text-[10px] text-white truncate">{img.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StepProblem;

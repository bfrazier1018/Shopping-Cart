$(function() {

	// Text Area CKEditor
	if ($('textarea#ta').length) {
		CKEDITOR.replace('ta');
	}

	// Confirm Deletion
	$('a.confirmDeletion').on('click', () => {
		if (!confirm('Confirm deletion'))
			return false;
	});
});
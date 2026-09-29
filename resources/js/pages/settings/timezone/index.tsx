import {
    type SubmitEvent,
    useCallback,
} from 'react';

import {
    Head,
    useForm,
} from '@inertiajs/react';

import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardBody,
} from '@/components/ui/card';
import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';

type TimezoneIndexPageProps = {
    timezone: string;
    timezones: string[];
};

type TimezoneSuggestion = {
    id: string;
    name: string;
};

export default function TimezoneIndexPage({
    timezone,
    timezones,
}: TimezoneIndexPageProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        recentlySuccessful,
    } = useForm({
        timezone: timezone ?? 'UTC',
    });

    /*
    |--------------------------------------------------------------------------
    | Search timezones
    |--------------------------------------------------------------------------
    |
    | SuggestionSearchInput expects:
    |
    | searchFn(query, signal?) => Promise<T[]>
    |
    | Since Laravel already sends all timezone_identifiers_list() values,
    | we can search them locally without making another HTTP request.
    |
    */

    const searchTimezones = useCallback(
        async (
            query: string,
            signal?: AbortSignal,
        ): Promise<TimezoneSuggestion[]> => {
            if (signal?.aborted) {
                return [];
            }

            const keyword = query
                .trim()
                .toLowerCase();

            const results = !keyword
                ? timezones
                : timezones.filter((timezoneOption) =>
                    timezoneOption
                        .toLowerCase()
                        .includes(keyword),
                );

            return results.map((timezoneOption) => ({
                id: timezoneOption,
                name: timezoneOption,
            }));
        },
        [timezones],
    );

    const handleSubmit = (
        event: SubmitEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        post('/setup/timezone', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Timezone" />

            <PageTitle title="Timezone setup" />

            <div className="container-fluid">
                <Card>
                    <CardBody>
                        <form
                            onSubmit={handleSubmit}
                            noValidate
                        >
                            <div className="row">
                                <div className="col-12">
                                    <FormField>
                                        <FormLabel
                                            htmlFor="timezone"
                                            required
                                        >
                                            Select Timezone
                                        </FormLabel>

                                        <SuggestionSearchInput<TimezoneSuggestion>
                                            searchFn={
                                                searchTimezones
                                            }
                                            idKey="id"
                                            labelKey="name"
                                            defaultValue={
                                                timezone ?? 'UTC'
                                            }
                                            placeholder="Search timezone..."
                                            error={
                                                errors.timezone
                                            }
                                            disabled={
                                                processing
                                            }
                                            showSearchIcon={false}
                                            clearOnFocus={
                                                false
                                            }
                                            onSelect={(
                                                selectedTimezone,
                                            ) => {
                                                setData(
                                                    'timezone',
                                                    selectedTimezone.name,
                                                );
                                            }}
                                            onClear={() => {
                                                setData(
                                                    'timezone',
                                                    '',
                                                );
                                            }}
                                        />

                                        <FormError
                                            error={
                                                errors.timezone
                                            }
                                        />
                                    </FormField>
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-3">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={
                                        processing ||
                                        !data.timezone
                                    }
                                >
                                    {processing
                                        ? 'Updating...'
                                        : 'Update timezone'}
                                </Button>

                                {recentlySuccessful && (
                                    <span className="text-success">
                                        Timezone updated
                                        successfully.
                                    </span>
                                )}
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}

// This is a copy of Plutora internal enums to avoid magic strings / number
export const PlutoraEnum = Object.freeze({
    Release: {
        ReleaseType: {
            Enterprise: 'Enterprise',
            EnterpriseNumber: 1,
            Integrated:  'Integrated',
            IntegratedNumber:  2,
            Independent:  'Independent',
            IndependentNumber:  3,
        },
        ReleaseProjectType:
        {
            IsProject: 'IsProject',
            IsProjectNumber:  1,
            NotIsProject: 'NotIsProject',
            NotIsProjectNumber: 2,
            None: 'None',
            NoneNumber: 3,
        }
    }
});
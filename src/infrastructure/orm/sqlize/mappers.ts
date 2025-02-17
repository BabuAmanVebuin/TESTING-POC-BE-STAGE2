// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

// Mapper type for transforming Entity type to Data Transfer Object type(DB) and vice versa
export interface Mapper<A, B> {
  readonly toPersistence: (domain: A) => B
  readonly toEntity: (dto: B) => A
}
